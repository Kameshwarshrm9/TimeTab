import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ViewTimetable = () => {
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [error, setError] = useState('');
  const timetableRef = useRef(null);

  const fetchTimetable = async () => {
    if (!branch || !semester) {
      alert('Please select both branch and semester!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/${branch}/${semester}`);
      const data = await response.json();

      if (response.ok) {
        setTimetable(data.timetable);
        setError('');
      } else {
        setError(data.message);
        setTimetable(null);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError('Error fetching timetable');
      setTimetable(null);
    }
  };

  const downloadPDF = () => {
    const element = timetableRef.current;
    if (!element) return;

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add college name
      pdf.setFontSize(16);
      pdf.text('Government College of Engineering and Technology', pageWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Timetable for ${branch} Semester ${semester}`, pageWidth / 2, 25, { align: 'center' });

      // Add timetable image
      pdf.addImage(imgData, 'PNG', 10, 35, imgWidth, imgHeight);

      // Add teachers list
      const teachers = [...new Set(timetable.map((entry) => entry.teacher.name))];
      let yPosition = 35 + imgHeight + 10;
      pdf.setFontSize(12);
      pdf.text('Teachers:', 10, yPosition);
      yPosition += 10;
      teachers.forEach((teacher) => {
        pdf.text(`- ${teacher}`, 15, yPosition);
        yPosition += 7;
      });

      pdf.save(`timetable_${branch}_sem${semester}.pdf`);
    });
  };

  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 01:00',
    '02:00 - 03:00',
    '03:00 - 04:00',
  ];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const timetableGrid = days.map((day) => ({
    day,
    slots: timeSlots.reduce((acc, slot) => ({ ...acc, [slot]: null }), {}),
  }));

  if (timetable) {
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

      <div className="mb-4 flex space-x-4">
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

      <div className="flex space-x-4">
        <button
          onClick={fetchTimetable}
          className="mt-4 w-full py-2 bg-blue-600 text-white font-semibold rounded-md"
        >
          View Timetable
        </button>
        {timetable && (
          <button
            onClick={downloadPDF}
            className="mt-4 w-full py-2 bg-green-600 text-white font-semibold rounded-md"
          >
            Download PDF
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-2 text-center text-red-500">
          {error}
        </div>
      )}

      {timetable && (
        <div className="mt-6 overflow-x-auto" ref={timetableRef}>
          <h2 className="text-xl font-semibold mb-4">Timetable for {branch} Semester {semester}</h2>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Day</th>
                {timeSlots.map((slot) => (
                  <th key={slot} className="border border-gray-300 px-4 py-2 text-center">{slot}</th>
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
                          <div className="font-semibold">{row.slots[slot].subject}</div>
                          <div className="text-sm text-gray-600">{row.slots[slot].teacher}</div>
                        </div>
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