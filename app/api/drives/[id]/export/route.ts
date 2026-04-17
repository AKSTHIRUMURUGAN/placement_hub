import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Application from '@/lib/db/models/Application';
import Student from '@/lib/db/models/Student';
import Drive from '@/lib/db/models/Drive';
import { requireAdmin } from '@/lib/utils/auth';
import { errorResponse } from '@/lib/utils/response';

// GET /api/drives/[id]/export - Export applications
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    const drive = await Drive.findById(id);
    if (!drive) {
      return errorResponse('Drive not found', 404);
    }

    const applications = await Application.find({ driveId: id })
      .populate('studentId', 'name regNo email department cgpa graduationYear phone dateOfBirth gender')
      .sort({ appliedAt: -1 })
      .lean();

    if (format === 'csv') {
      const csvHeaders = [
        'Name',
        'Registration Number',
        'Email',
        'Phone',
        'Department',
        'CGPA',
        'Graduation Year',
        'Gender',
        'Date of Birth',
        'Application Status',
        'Applied Date',
      ];

      const csvRows = applications.map(app => {
        const student = app.studentId as any;
        return [
          student.name,
          student.regNo,
          student.email,
          student.phone || '',
          student.department,
          student.cgpa,
          student.graduationYear,
          student.gender || '',
          student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '',
          app.status,
          new Date(app.appliedAt).toLocaleDateString(),
        ];
      });

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${drive.companyName}_${drive.role}_applications.csv"`,
        },
      });
    }

    // For Excel format, we'll return JSON that can be processed by a library like xlsx
    const excelData = applications.map(app => {
      const student = app.studentId as any;
      return {
        'Name': student.name,
        'Registration Number': student.regNo,
        'Email': student.email,
        'Phone': student.phone || '',
        'Department': student.department,
        'CGPA': student.cgpa,
        'Graduation Year': student.graduationYear,
        'Gender': student.gender || '',
        'Date of Birth': student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '',
        'Application Status': app.status,
        'Applied Date': new Date(app.appliedAt).toLocaleDateString(),
      };
    });

    return new Response(JSON.stringify(excelData), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${drive.companyName}_${drive.role}_applications.json"`,
      },
    });

  } catch (error: any) {
    return errorResponse(error.message, error.message.includes('Forbidden') ? 403 : 500);
  }
}