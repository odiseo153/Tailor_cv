import * as React from "react";

interface EmailTemplateProps {
  name: string;
  email: string;
  industry: string;
  message: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  name,
  email,
  industry,
  message,
}) => (
  <>
    <link
      href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
      rel="stylesheet"
    />
    
    <div className="max-w-lg mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Nuevo mensaje recibido</h2>
      <p className="text-gray-600 mb-6">Se ha recibido un nuevo mensaje a través de la aplicación.</p>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-700">Nombre:</p>
          <p className="text-gray-900">{name}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Email:</p>
          <p className="text-gray-900">{email}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Industria:</p>
          <p className="text-gray-900">{industry}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Mensaje:</p>
          <p className="text-gray-900">{message}</p>
        </div>
      </div>


    </div>
  </>
);
