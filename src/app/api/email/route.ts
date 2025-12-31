import { NextResponse, NextRequest } from 'next/server';
import { Resend } from 'resend';
import { EmailTemplate } from '@/app/components/Templates/EmailTemplate';

const resend = new Resend(process.env.NEXT_PUBLIC_API_RESEND_API_KEY);


export async function POST(request: NextRequest) {
    const dataJson = await request.json();
    const { email, name, industry, message } = dataJson;


    const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: ['odiseotech@gmail.com'],
        subject: 'FeedBack del usuario',
        react: await EmailTemplate({
            email,
            name,
            industry,
            message
        }),
    });

    if (error) {
        console.log(error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }


    return NextResponse.json({ message: 'Mensaje enviado correctamente' }, { status: 200 });


}