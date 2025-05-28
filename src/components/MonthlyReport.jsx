import React, { useContext, useState } from 'react'
import { AuthContext } from '../Provider';
import { IoCloudDownloadOutline } from "react-icons/io5";
import * as XLSX from 'xlsx';

import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Importing jsPDF autoTable plugin if necessary

function MonthlyReport() {
    const { notifyFailed, month, year, notifySuccess, role, date, getMonth } = useContext(AuthContext)
    const [students, setStudents] = useState([])

    const [paymentMonth, setPaymentMonth] = useState(month)
    const [paymentYear, setPaymentYear] = useState(year)
    const [batch, setBatch] = useState('')

    const [loading, setLoading] = useState(false)

    const getFirstName = fullname => {
        const nameParts =fullname.trim().split(' ')
        if (nameParts[0].toLowerCase()=='md'){
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
        const discounted = e.target.discounted.value;
        if (level) {
            query.level = level;
        }
        if (batch) query.batch = batch;

        if (session) query.session = session;
        if (discounted) {
            query.discounted = discounted;
        }

        try {
            const res = await fetch('https://spoffice-server.vercel.app/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(query),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await res.json();
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
            const payment =student.payments.find(
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
                "Payment":payment 
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
            `Attendance Sheet - ${batch} - ${getMonth(paymentMonth)}, ${paymentYear}.xlsx`
        );
    };




    const handleDownload = async () => {
        try {
            // Create jsPDF instance with landscape orientation
            const doc = new jsPDF("landscape");

            let isFirstPage = true; // Track if it's the first page for adding title and logo

            // Table headers
            const headers = [
                "Sl No", "Roll", "Name", "Phone", "Program", "Payment", ...Array.from({ length: 31 }, (_, i) => (i + 1).toString())
            ];

            // Table data rows for students
            const sortedStudents = sortArray(students)
            const tableData = sortedStudents.map((student, index) => {
                const payment =student.payments.find(payment => payment.pmonth == paymentMonth && payment.pyear == paymentYear);
                return [
                    index + 1,
                student.id,
                student.name,
                student.phone,
                (student.programs.length) ? student.programs[student.programs.length - 1].program : "Free Class",
                payment ?
                    getFirstName(payment.ptaken) : "Unpaid",
                ...Array.from({ length: 31 }, (_, i) => {
                    const date = `${i + 1}-${paymentMonth}-${paymentYear}`;
                    return student.attendances.some((att) => att.date === date) ? "P" : "";
                }),
                // Empty comments column
           
                ]
            })

            // Column width configuration (fixed widths)


            // Fetch the logo image as a base64 URL
            const fetchLogo = async () => {
                const logoUrl = "/logo.png"; // Replace with the correct URL to your logo
                const response = await fetch(logoUrl);
                const blob = await response.blob();
                const reader = new FileReader();
                return new Promise((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            };

            // Wait for the logo to be loaded before generating the PDF
            const logoUrlBase64 = await fetchLogo();

            // Add table using autoTable plugin
            doc.autoTable({
                head: [headers],
                body: tableData,
                startY: 40,
                columnStyles: {
                    0: { cellWidth: 10 }, // Sl No
                    1: { cellWidth: 15 }, // Roll
                    2: { cellWidth: 30 }, // Name
                    3: { cellWidth: 25 }, // Phone
                    4: { cellWidth: 27 }, // Program
                    5: { cellWidth: 18 }, // Payment
                    ...Array.from({ length: 31 }, (_, i) => ({ [i + 6]: { cellWidth: 5 } })).reduce(
                        (acc, curr) => ({ ...acc, ...curr }),
                        {}
                    ), // Day columns

                },
                theme: "grid",
                headStyles: {
                    fillColor: [242, 242, 242],
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                    halign: "center",
                    minCellHeight: 5,
                    cellPadding: 1,
                    lineWidth: 0.5,
                    lineColor: [200, 200, 200],
                },
                bodyStyles: {
                    minCellHeight: 4,
                    cellPadding: 1,
                    lineWidth: 0.5,
                    lineColor: [200, 200, 200],
                },
                margin: { top: 10, bottom: 10, left: 10, right: 10 },
                didDrawPage: (data) => {
                    if (isFirstPage) {
                        doc.addImage(logoUrlBase64, "PNG", 10, 10, 30, 30);
                        const pageWidth = doc.internal.pageSize.width;
                        doc.setFontSize(16);
                        doc.text("Sohag Physics", pageWidth / 2, 20, { align: "center" });
                        doc.setFontSize(12);
                        doc.text(
                            `Attendance Sheet for ${batch} - ${getMonth(paymentMonth)}, ${paymentYear}`,
                            pageWidth / 2,
                            30,
                            { align: "center" }
                        );
                        isFirstPage = false;
                    }
                },
                pageBreak: "auto",
            });


            // Save the generated PDF
            doc.save(`Attendance sheet of batch ${students[0].batch} ${getMonth(paymentMonth)},${paymentYear}.pdf`);
        } catch (err) {
            console.log("Error generating PDF:", err);
        }
    };
















    return (
        (role == 'CEO' || role == 'Manager') ? <div className=''>
            <h1 className=' text-center lg:text-left md:text-center font-semibold text-2xl text-cyan-500 underline mt-10'>Monthly Report</h1>
            <form className='mx-auto w-full' onSubmit={handleSearch} >

                {/* students part */}
                <div className='flex mt-2 flex-col lg:flex-row'>
                    <h1 className='font-bold text-lg lg:w-1/4'>Searching Options :</h1>
                    <div className='grid grid-cols-1 lg:w-2/3 lg:grid-cols-2 gap-3'>


                        <div>
                            <p className='font-semibold'>Batch </p>

                            <select name='batch' className="select text-lg font-semibold  select-info w-full ">

                                <option value={'Hsc-27-Marketing'}>Hsc-27 (Marketing)</option>
                                <option value={'Sat 1'}>শনি ৭টা (HSC 27)</option>
                                <option value={'Sat 2'}>শনি ৮টা (HSC 27)</option>
                                <option value={'Sat 3'}>শনি ৯টা (নিউ টেন SSC 26 - HSC 28)</option>
                                <option value={'Sat 4'}>শনি ১০টা (নিউ নাইন SSC 27 - HSC 29)</option>
                                <option value={'Sat 5'}>শনি ১১টা </option>

                                <option value={'Sat 6'}>শনি ২টা (HSC 26)</option>
                                <option value={'Sat 7'}>শনি ৩টা (HSC 26)</option>
                                <option value={'Sat 8'}>শনি ৪টা (HSC 27)</option>
                                <option value={'Sat 9'}>শনি ৫টা (HSC 26)</option>
                                <option value={'Sat 10'}>শনি ৬.১৫টা (HSC 27)</option>
                                <option value={'Sat 11'}>শনি ৭.১৫ টা (নিউ টেন SSC 26 - HSC 28)</option>
                                <option value={'Sun 1'}>রবি ৭টা (HSC 27)</option>
                                <option value={'Sun 2'}>রবি ৮টা (HSC 26)</option>
                                <option value={'Sun 3'}>রবি ৯টা (HSC 27)</option>
                                <option value={'Sun 4'}>রবি ১০টা (Nine & Ten combined)</option>
                                <option value={'Sun 5'}>রবি ১১টা </option>

                                <option value={'Sun 6'}>রবি ২টা (HSC 26) </option>
                                <option value={'Sun 7'}>রবি ৩টা (HSC 27) </option>
                                <option value={'Sun 8'}>রবি ৪টা (HSC 26) </option>
                                <option value={'Sun 9'}>রবি ৫টা (HSC 26) </option>
                                <option value={'Sun 10'}>রবি ৬টা (নিউ নাইন SSC 27 - HSC 29) </option>
                                <option value={'Sun 11'}>রবি ৭টা (নিউ টেন SSC 26 - HSC 28) </option>
                                <option>HSC 26 Admission cancel</option>
                                <option>HSC 27 Admission cancel</option>
                                <option>SSC 26 class 10 Admission cancel</option>
                                <option>SSC 27 class 9 Admission cancel</option>
                                <option>Exam Batch HSC 26</option>
                                <option>Exam Batch (নিউ নাইন SSC 27 - HSC 29)</option>
                                <option>Exam Batch (নিউ টেন SSC 26 - HSC 28)</option>


                                <option>SSC 25 (Physics Olympiad)</option>
                                <option>Class 9 (SSC 27) Phy Champ</option>
                                <option>Class 10 (SSC 26) Phy Champ</option>

                            </select>
                        </div>
                        <div>
                            <p className='font-semibold'>Class  </p>

                            <select name='class' className="select text-lg font-semibold  select-info w-full ">

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
                            <select name='program' className="select text-lg font-semibold  select-info w-full ">
                                <option value={''}>All</option>
                                <option value={'Free'}>Free Class</option>
                                <option value={'HscPhy'}>HSC Physics</option>
                                <option value={'HscPhyDue'}>HSC Physics Due</option>
                                <option value={'PBC'}>PBC</option>
                                <option value={'SscPhy'}>SSC Physics</option>
                                <option value={'MonthlyDue'}>Monthly Payment Due</option>

                                <option value={'SscPhyDue'}>SSC Physics Due</option>
                                <option value={'Exam'}>Exam Batch </option>
                                <option value={'ExamDue'}>Exam Batch Due </option>
                                <option value={'Others'}>Others </option>
                                <option value={'OthersDue'}>Others Due </option>




                            </select>
                        </div>
                        <div >
                            <p className='font-semibold'>Discounted Students  </p>
                            <select name='discounted' className="select text-lg font-semibold  select-info w-full ">
                                <option value={''}>Not Applicable</option>
                                <option value={true}>Discounted</option>





                            </select>
                        </div>
                        <div className='lg:col-span-2'>
                            <p className='font-semibold'>Session  </p>
                            <select name='session' className="select text-lg font-semibold  select-info w-full ">


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
                            <p className='font-semibold'>Month  </p>
                            <select
                                onChange={handleMonthChange}
                                defaultValue={month}
                                name='month'

                                className="select text-lg font-semibold  select-info w-full"
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
                            <p className='font-semibold'>Year  </p>
                            <select onChange={handleYearChange} defaultValue={year} name='year' className="select text-lg font-semibold  select-info w-full ">

                                <option>2024</option>
                                <option>2025</option>
                                <option>2026</option>
                            </select>
                        </div>


                    </div>
                </div>

                <div className='flex mt-10 flex-col w-full lg:flex-row'>
                    <h1 className='font-bold text-lg lg:w-1/4'></h1>
                    <div className='lg:w-2/3 text-center'>
                        <input className=" text-lg font-semibold h-11 w-full bg-blue-100  border-2 rounded-xl    btn-outline btn-info py-2 px-6 text-blue-950" type='submit' value={`${loading ? "" : "Find Info"}`} />
                        <p className={`flex items-center  gap-1 justify-center -mt-9 font-semibold text-orange-800 ${loading ? "" : 'hidden'}`}>   <span className="loading loading-dots loading-sm"></span> Loading</p>
                    </div>
                </div>



            </form>

            {
                students.length ?
                    <div>
                        <div className='text-sky-600 text-center mt-8'>
                            <hr />
                            <p className='text-xl font-semibold'>Total Students Found <span className='font-bold text-red-600 text-2xl border-sky-600 border-2 rounded-full  px-2'>{students.length}</span></p>

                            <button onClick={handleDownload} className='flex items-center justify-center gap-1  border-2 font-bold text-sky-600 hover:bg-slate-400 py-1 mt-3 w-full hover:text-white  rounded-lg border-sky-600'><IoCloudDownloadOutline /> Download PDF</button>
                            <div className="divider divider-primary">OR</div>
                            <button onClick={handleExcel} className='flex items-center justify-center gap-1  border-2 font-bold text-sky-600 hover:bg-slate-400 py-1 mt-3 w-full hover:text-white  rounded-lg border-sky-600'><IoCloudDownloadOutline /> Download Excell</button>

                        </div>

                    </div>
                    : <></>
            }


        </div> : <div className='text-red-600'> You Don't Have Permission</div>
    )
}

export default MonthlyReport