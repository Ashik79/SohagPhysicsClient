import React, { useContext, useState } from 'react'
import { AuthContext } from '../../Provider';
import { IoCloudDownloadOutline } from "react-icons/io5";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Importing jsPDF autoTable plugin if necessary

function ExamReport() {
    const { notifyFailed, month, year, notifySuccess, role, date, getMonth } = useContext(AuthContext)
    const [students, setStudents] = useState([])
    const [exams, setExams] = useState([])

    const [paymentMonth, setPaymentMonth] = useState(month)
    const [paymentYear, setPaymentYear] = useState(year)
    const [batch, setBatch] = useState('')
    const [session, setSession] = useState('')

    const [loading, setLoading] = useState(false)

    const getFirstName = fullname => {
        const nameParts = fullname.trim().split(' ')
        if (nameParts[0].toLowerCase() == 'md') {
            return nameParts[1]
        }
        return nameParts[1]

    }


    const handleMonthChange = (event) => {
        setPaymentMonth(event.target.value);
    };

    const handleYearChange = (event) => {
        setPaymentYear(event.target.value);
    };

    const sortArray = arr => {
        let ar = arr;
        if (ar.length) {
            ar.sort((a, b) => parseInt(a.id) - parseInt(b.id)
            )
            return ar
        }
        else return []
    }




    const handleSearch = async (e) => {
        setLoading(true)
        e.preventDefault();
        const query = {};

        const batch = e.target.batch.value;
        setBatch(batch)
        const level = e.target.class.value;
        const program = e.target.program.value;
        const session = e.target.session.value;
        const month = e.target.month.value;
        const year = e.target.year.value;
        setSession(session)

        if (level) {
            query.level = level;
        }
        if (batch) query.batch = batch;
        if (session) query.session = session;
        const examQuery = { ...query }
        if (month) examQuery.month = month;
        if (year) examQuery.year = year;


        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(query),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await res.json();
            //exam find kore ana
            const res2 = await fetch(`${import.meta.env.VITE_API_URL}/exams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(examQuery),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            const data2 = await res2.json();
            //console.log(data2)
            setExams(data2)


            let filteredStudents = data;

            // Filter by program
            if (program) {
                if (program == 'Free') {
                    filteredStudents = filteredStudents.filter(student => student.programs.length == 0)
                }
                else {
                    filteredStudents = filteredStudents.filter(student =>
                        student.programs && student.programs.some(p => p.program === program)
                    )
                }
            }



            // Filter by attendance status


            setStudents(filteredStudents);


            if (filteredStudents.length) {
                notifySuccess(`Found ${filteredStudents.length} students`);
                setLoading(false)
            } else {
                notifyFailed('Sorry, no student is found');
                setLoading(false)
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            notifyFailed('An error occurred while fetching data');
            setLoading(false)
        }
    };







    //Download as excell file

    const handleExcel = () => {
        if (students.length === 0) {
            notifyFailed('No student data to export.');
            return;
        }
        const sortedStudents = sortArray(students)
        const data = sortedStudents.map((student, index) => {
            const payment = student.payments.find(
                payment =>
                    payment.pmonth == paymentMonth && payment.pyear == paymentYear
            )


            const row = {
                // "Sl No": index + 1,
                "Roll": student.id,
                "Name": student.name,
                "Phone": student.phone,
                "Program": student.programs.length
                    ? student.programs[student.programs.length - 1].program
                    : "Free Class",
                "Payment": payment
                    ? getFirstName(payment.ptaken)
                    : "Unpaid"
            };

            // Add attendance per day
            for (let i = 1; i <= 31; i++) {
                const date = `${i}-${paymentMonth}-${paymentYear}`;
                row[`Day ${i}`] = student.attendances.some(att => att.date === date)
                    ? "P"
                    : "";
            }

            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");

        XLSX.writeFile(
            workbook,
            `Attendance Sheet -Batch: ${batch} - Session:${session ? session : 'All'} ,Month: ${getMonth(paymentMonth)}, ${paymentYear}.xlsx`
        );
    };




    const handleDownload = async () => {
        try {
            // Create jsPDF instance with landscape orientation
            const doc = new jsPDF("landscape");

            let isFirstPage = true; // Track if it's the first page for adding title and logo

            // Table headers
            const headers = [
                "Sl No", "Roll", "Name", "Phone", "Program", "Payment", "session", ...Array.from({ length: exams.length }, (_, i) => (exams[i].title.slice(0, 32)) + '(' + (exams[i].mcqTotal + exams[i].writenTotal).toString() + ')')
            ];

            // Table data rows for students
            const sortedStudents = sortArray(students)
            const tableData = sortedStudents.map((student, index) => {
                const payment = student.payments.find(payment => payment.pmonth == paymentMonth && payment.pyear == paymentYear);
                return [
                    index + 1,
                    student.id,
                    student.name,
                    student.phone,
                    (student.programs.length) ? student.programs[student.programs.length - 1].program : "Free Class",
                    payment ?
                        getFirstName(payment.ptaken) : "Unpaid",
                    student.session,
                    ...Array.from({ length: exams.length }, (_, i) => {
                        const exam = exams[i];

                        const found = student.exams.find(e => e.title == exam.title)

                        return found ? `              ${found.total} / ${found.mcqTotal + found.writenTotal}` : '                 A';
                    }),
                    // Empty comments column

                ]
            })

            // Column width configuration (fixed widths)


            // Fetch logic
            const fetchLogo = async () => {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2000);
                    const response = await fetch("/logo.png", { signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (!response.ok) return null;
                    const blob = await response.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = () => resolve(null);
                        reader.readAsDataURL(blob);
                    });
                } catch (e) { return null; }
            };

            Swal.fire({
                title: 'Generating PDF...',
                html: 'Preparing full exam report',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const logoBase64 = await fetchLogo();

            doc.autoTable({
                head: [headers],
                body: tableData,
                startY: 40,
                columnStyles: {
                    0: { cellWidth: 7 },
                    1: { cellWidth: 15 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 18 },
                    5: { cellWidth: 18 },
                    6: { cellWidth: 10 },
                    ...Array.from({ length: exams.length }, (_, i) => ({ [i + 7]: { cellWidth: 40 } })).reduce(
                        (acc, curr) => ({ ...acc, ...curr }),
                        {}
                    ),
                },
                theme: "grid",
                headStyles: {
                    fillColor: [242, 242, 242],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "center",
                    fontSize: 8,
                    cellPadding: 1,
                },
                bodyStyles: {
                    fontSize: 8,
                    cellPadding: 1,
                },
                margin: { top: 10, bottom: 10, left: 10, right: 10 },
                didDrawPage: (data) => {
                    if (isFirstPage) {
                        if (logoBase64) {
                            try { doc.addImage(logoBase64, "PNG", 10, 10, 20, 20); } catch (e) { }
                        }
                        const pageWidth = doc.internal.pageSize.width;
                        doc.setFontSize(16);
                        doc.text("Sohag Physics", pageWidth / 2, 20, { align: "center" });
                        doc.setFontSize(11);
                        doc.text(
                            `Exam Sheet: Batch ${batch}, Month ${getMonth(paymentMonth)} ${paymentYear}`,
                            pageWidth / 2,
                            28,
                            { align: "center" }
                        );
                        isFirstPage = false;
                    }
                },
            });

            const pdfBlob = doc.output('blob');
            saveAs(pdfBlob, `Exam_Report_${batch}_${getMonth(paymentMonth)}.pdf`);
            Swal.close();
            Swal.fire({ icon: 'success', title: 'PDF Ready!', timer: 1500, showConfirmButton: false });
        } catch (err) {
            console.error(err);
            Swal.close();
            Swal.fire({ icon: 'error', title: 'Generation Failed', text: err.message });
        }
    };
















    return (
        (role == 'CEO' || role == 'Manager') ? <div className=''>
            <h1 className=' text-center lg:text-left md:text-center font-semibold text-xl text-cyan-500 underline mt-10'>Exam Report</h1>
            <form className='mx-auto w-full' onSubmit={handleSearch} >

                {/* students part */}
                <div className='flex mt-2 flex-col lg:flex-row'>
                    <h1 className='font-bold text-base lg:w-1/4'>Searching Options :</h1>
                    <div className='grid grid-cols-1 lg:w-2/3 lg:grid-cols-2 gap-3'>


                        <div>
                            <p className='font-semibold'>Batch </p>

                            <select name='batch' className="select text-base font-semibold  select-info w-full ">




                                <option value={'Olympiad-HSC27'}>Olympiad HSC 27</option>
                                <option value={'Sat 1'}>শনি à§­à¦Ÿা (HSC 27)</option>
                                <option value={'Sat 2'}>শনি à§®à¦Ÿা (à¦¨à¦¿à¦‰ à¦¨à¦¾à¦‡ন SSC 28 - HSC 30)</option>
                                <option value={'Sat 3'}>শনি à§¯à¦Ÿা (à¦¨à¦¿à¦‰ à¦¨à¦¾à¦‡ন SSC 28 - HSC 30)</option>
                                <option value={'Sat 4'}>শনি à§§à§¦à¦Ÿা (à¦¨à¦¿à¦‰ à¦¨à¦¾à¦‡ন SSC 27 - HSC 29)</option>
                                <option value={'Sat 5'}>শনি à§§à§§à¦Ÿা - SSC 26 (All Batch) </option>
                                <option value={'Sat 12'}>শনি à§§à§¨à¦Ÿা - New Nine (SSC 28 Special Batch) </option>

                                <option value={'Sat 6'}>শনি à§¨à¦Ÿা (HSC 27)</option>
                                <option value={'Sat 7'}>শনি à§©à¦Ÿা - HSC 27 (New Batch)</option>
                                <option value={'Sat 8'}>শনি à§ªà¦Ÿা (SSC 27)</option>
                                <option value={'Sat 9'}>শনি à§«à¦Ÿা - SSC 28 (New Nine)</option>
                                <option value={'Sat 10'}>শনি à§¬à¦Ÿা (SSC 28)</option>
                                <option value={'Sat 11'}>শনি ৭ à¦Ÿা ( SSC 27 - HSC 29)</option>
                                <option value={'Sun 1'}>রবি à§­à¦Ÿা (HSC 27)</option>
                                <option value={'Sun 2'}>রবি à§®à¦Ÿা (HSC 26)</option>
                                <option value={'Sun 3'}>রবি à§¯à¦Ÿা - HSC 27 (New Batch)</option>
                                <option value={'Sun 4'}>রবি à§§à§¦à¦Ÿা (HSC 28)</option>
                                <option value={'Sun 5'}>রবি à§§à§§à¦Ÿা </option>

                                <option value={'Sun 6'}>রবি à§¨à¦Ÿা (HSC 26) </option>
                                <option value={'Sun 7'}>রবি à§©à¦Ÿা (HSC 27) </option>
                                <option value={'Sun 8'}>রবি à§ªà¦Ÿা (HSC 26) </option>
                                <option value={'Sun 9'}>রবি à§«à¦Ÿা (HSC 27) </option>
                                <option value={'Sun 10'}>রবি à§¬à¦Ÿা (SSC 27 - HSC 29) </option>
                                <option value={'Sun 11'}>রবি à§­à¦Ÿা - SSC 28 (New Nine) </option>
                                <option>HSC 26 Admission cancel</option>
                                <option>HSC 27 Admission cancel</option>
                                <option>SSC 26 class 10 Admission cancel</option>
                                <option>SSC 27 class 9 Admission cancel</option>
                                <option>Exam Batch HSC 26</option>
                                <option>Exam Batch (à¦¨à¦¿à¦‰ à¦¨à¦¾à¦‡ন SSC 27 - HSC 29)</option>
                                <option>Exam Batch (à¦¨à¦¿à¦‰ à¦Ÿà§‡ন SSC 26 - HSC 28)</option>
                                <option value={'Olympiad-8'}>Olympiad 8 (ssc 28 - hsc 30)</option>
                                <option value={'Olympiad-9'}>Olympiad 9 (ssc 27 - hsc 29)</option>
                                <option value={'Hsc-27-Marketing'}>Hsc-27 (Marketing)</option>


                                <option>SSC 25 (Physics Olympiad)</option>
                                <option>Class 9 (SSC 27) Phy Champ</option>
                                <option>Class 10 (SSC 26) Phy Champ</option>

                            </select>
                        </div>
                        <div className='hidden'>
                            <p className='font-semibold'>Class  </p>

                            <select name='class' className="select text-base font-semibold  select-info w-full ">

                                <option value={""}>All</option>
                                <option>Eight</option>
                                <option>Nine</option>
                                <option>Ten</option>
                                <option>SSC</option>
                                <option>Eleven</option>
                                <option>Tweleve</option>
                                <option>HSC</option>
                                <option>Admission</option>
                                <option>BCS</option>

                            </select>
                        </div>

                        <div>
                            <p className='font-semibold'>Program  </p>
                            <select name='program' className="select text-base font-semibold  select-info w-full ">
                                <option value={''}>All</option>
                                <option value={'Free'}>Free Class</option>
                                <option value={'HscPhy'}>HSC Physics</option>
                                <option value={'HscPhyDue'}>HSC Physics Due</option>



                                <option value={'SscPhy'}>SSC Physics</option>
                                <option value={'MonthlyDue'}>Monthly Payment Due</option>

                                <option value={'SscPhyDue'}>SSC Physics Due</option>


                                <option value={'suggestion'}>Suggestion Fee </option>





                            </select>
                        </div>

                        <div className=''>
                            <p className='font-semibold'>Session  </p>
                            <select name='session' className="select text-base font-semibold  select-info w-full ">


                                <option value={""}>All</option>
                                <option>2025</option>
                                <option>2026</option>
                                <option>2027</option>
                                <option>2028</option>
                                <option>2029</option>
                                <option>2030</option>


                            </select>
                        </div>



                        <div>
                            <p className='font-semibold'>Exam Month  </p>
                            <select
                                onChange={handleMonthChange}
                                defaultValue={month}
                                name='month'

                                className="select text-base font-semibold  select-info w-full"
                            >

                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                        </div>


                        <div>
                            <p className='font-semibold'>Exam Year  </p>
                            <select onChange={handleYearChange} defaultValue={year} name='year' className="select text-base font-semibold  select-info w-full ">

                                <option>2024</option>
                                <option>2025</option>
                                <option>2026</option>
                                <option>2027</option>
                                <option>2028</option>
                                <option>2029</option>
                                <option>2030</option>
                            </select>
                        </div>


                    </div>
                </div>

                <div className='flex mt-10 flex-col w-full lg:flex-row'>
                    <h1 className='font-bold text-base lg:w-1/4'></h1>
                    <div className='lg:w-2/3 text-center'>
                        <input className=" text-base font-semibold h-11 w-full bg-blue-100  border-2 rounded-xl    btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? "" : "Find Info"}`} />
                        <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                    </div>
                </div>



            </form>

            {
                students.length ?
                    <div>
                        <div className='text-sky-600 text-center mt-8'>
                            <hr />
                            <p className='text-base font-semibold'>Total Students Found <span className='font-bold text-red-600 text-2xl border-sky-600 border-2 rounded-full  px-2'>{students.length}</span></p>

                            <button onClick={handleDownload} className='flex items-center justify-center gap-1  border-2 font-bold text-sky-600 hover:bg-slate-400 py-1 mt-3 w-full hover:text-white  rounded-lg border-sky-600'><IoCloudDownloadOutline /> Download PDF</button>
                            {/* <div className="divider divider-primary">OR</div>
                            <button onClick={handleExcel} className='flex items-center justify-center gap-1  border-2 font-bold text-sky-600 hover:bg-slate-400 py-1 mt-3 w-full hover:text-white  rounded-lg border-sky-600'><IoCloudDownloadOutline /> Download Excell</button> */}

                        </div>

                    </div>
                    : <></>
            }


        </div> : <div className='text-red-600'> You Don't Have Permission</div>
    )
}

export default ExamReport