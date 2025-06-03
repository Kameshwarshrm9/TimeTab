import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';

const ViewTeacherTimetable = () => {
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [error, setError] = useState('');
  const timetableRef = useRef(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/teachers');
        const data = await response.json();
        if (response.ok) {
          setTeachers(data);
        } else {
          setError(data.message || 'Error fetching teachers');
        }
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Error fetching teachers');
      }
    };
    fetchTeachers();
  }, []);

  const fetchTimetable = async () => {
    if (!teacherId) {
      alert('Please select a teacher!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/teacher-timetable/${teacherId}/schedule`);
      const data = await response.json();

      if (response.ok) {
        setTimetable(data);
        setError('');
      } else {
        setError(data.message || 'Error fetching timetable');
        setTimetable(null);
      }
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setError('Error fetching timetable');
      setTimetable(null);
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
        pdf.text(`Timetable for ${timetable.teacherName}`, pageWidth / 2, 25, { align: 'center' });

        pdf.addImage(imgData, 'PNG', 10, 35, imgWidth, finalHeight);

        const subjects = [...new Set(timetable.timetable.map((entry) => entry.subject))].filter(Boolean);
        let yPosition = 35 + finalHeight + 10;
        if (yPosition + subjects.length * 7 > pageHeight) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text('Subjects Taught:', 10, yPosition);
        yPosition += 8;
        subjects.forEach((subject) => {
          pdf.text(`- ${subject}`, 15, yPosition);
          yPosition += 7;
        });

        pdf.save(`timetable_teacher_${timetable.teacherId}.pdf`);
      })
      .catch((error) => {
        console.error('Could not generate PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      });
  };

  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 01:00',
    '02:00 - 03:00',
    '03:00 - 04:00',
    '04:00 - 05:00',
  ];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const timetableGrid = days.map((day) => ({
    day,
    slots: timeSlots.reduce((acc, slot) => ({
      ...acc,
      [slot]: null // No explicit break slot in backend; handle break visually
    }), {}),
  }));

  if (timetable && timetable.timetable) {
    timetable.timetable.forEach((entry) => {
      const dayIndex = days.indexOf(entry.day);
      if (dayIndex !== -1) {
        timetableGrid[dayIndex].slots[entry.timeSlot] = {
          subject: entry.subject,
          branch: entry.branch,
          semester: entry.semester,
        };
      }
    });
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">View Teacher Timetable</h1>

      <div className="mb-4 flex space-x-4">
        <div className="flex-1">
          <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">Teacher</label>
          <select
            id="teacher"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
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
          <h2 className="text-xl font-semibold mb-4">Timetable for {timetable.teacherName}</h2>
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
                          <div className="font-semibold">
                            {row.slots[slot].subject}
                          </div>
                          <div className="text-sm text-gray-600">
                            {row.slots[slot].branch} (Sem {row.slots[slot].semester})
                          </div>
                        </div>
                      ) : slot === '12:00 - 01:00' ? (
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

export default ViewTeacherTimetable;