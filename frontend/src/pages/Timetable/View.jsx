import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';

const ViewTimetable = () => {
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [error, setError] = useState('');
  const timetableRef = useRef(null);

  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 01:00',
    '01:00 - 02:00', // Break time updated to 1:00 - 2:00
    '02:00 - 03:00',
    '03:00 - 04:00',
    '04:00 - 05:00',
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const fetchTimetable = async () => {
    if (!branch || !semester) {
      alert('Please select both branch and semester!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/${branch}/${semester}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data.timetable)) {
        setTimetable(data.timetable);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch timetable');
        setTimetable([]);
      }
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError('Error fetching timetable');
      setTimetable([]);
    }
  };

  const downloadPDF = () => {
    const input = timetableRef.current;
    if (!input) {
      console.error('Timetable reference is not available');
      return;
    }

    input.style.display = 'block';

    htmlToImage
      .toPng(input, { quality: 0.95, pixelRatio: 2 })
      .then((imgData) => {
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pageWidth - 20;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        const maxHeight = pageHeight - 60;
        const finalHeight = imgHeight > maxHeight ? maxHeight : imgHeight;

        pdf.setFontSize(16);
        pdf.text('Government College of Engineering and Technology', pageWidth / 2, 15, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text(`Timetable for ${branch} Semester ${semester}`, pageWidth / 2, 25, { align: 'center' });

        pdf.addImage(imgData, 'PNG', 10, 35, imgWidth, finalHeight);

        const teachers = [...new Set(timetable.map((entry) => entry.teacher?.name || ''))].filter(Boolean);
        let yPosition = 35 + finalHeight + 10;
        if (yPosition + teachers.length * 7 > pageHeight) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text('Teachers:', 10, yPosition);
        yPosition += 8;
        teachers.forEach((teacher) => {
          pdf.text(`- ${teacher}`, 15, yPosition);
          yPosition += 7;
        });

        pdf.save(`timetable_${branch}_sem${semester}.pdf`);
      })
      .catch((error) => {
        console.error('Could not generate PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      });
  };

  const timetableGrid = days.map((day) => ({
    day,
    slots: timeSlots.reduce((acc, slot) => {
      acc[slot] = null; // No explicit break slot in backend; handle break visually
      return acc;
    }, {}),
  }));

  if (Array.isArray(timetable)) {
    timetable.forEach((entry) => {
      const dayIndex = days.indexOf(entry.day);
      if (dayIndex !== -1) {
        timetableGrid[dayIndex].slots[entry.timeSlot] = {
          subject: entry.subject.name,
          teacher: entry.teacher.name,
        };
      }
    });
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">View Timetable</h1>

      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
          <select
            id="branch"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">Select Branch</option>
            <option value="CSE">CSE</option>
            <option value="EE">EE</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="Civil">Civil</option>
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
          <select
            id="semester"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">Select Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        <button
          onClick={fetchTimetable}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md font-semibold"
        >
          View Timetable
        </button>

        {timetable.length > 0 && (
          <button
            onClick={downloadPDF}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md font-semibold"
          >
            Download PDF
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 text-red-500 text-center font-medium">{error}</div>
      )}

      {timetable.length > 0 && (
        <div className="mt-6 overflow-x-auto" ref={timetableRef}>
          <h2 className="text-xl font-semibold mb-4">
            Timetable for {branch} Semester {semester}
          </h2>

          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Day</th>
                {timeSlots.map((slot) => (
                  <th key={slot} className="border border-gray-300 px-4 py-2 text-center">
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timetableGrid.map((row, index) => (
                <tr key={row.day} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{row.day}</td>
                  {timeSlots.map((slot) => (
                    <td key={slot} className="border border-gray-300 px-4 py-2 text-center">
                      {row.slots[slot] ? (
                        <div>
                          <div className="font-semibold">
                            {row.slots[slot].subject}
                          </div>
                          <div className="text-sm text-gray-600">{row.slots[slot].teacher}</div>
                        </div>
                      ) : slot === '01:00 - 02:00' ? ( // Updated break slot
                        <div className="font-semibold text-blue-600">Lunch Break</div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewTimetable;