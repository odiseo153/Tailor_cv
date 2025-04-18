"use client"

import { useEffect } from "react"; // Importar useEffect
import CVPreferences from "./CVPreferences"
import EducationInfo from "./EducationInfo"
import PersonalInfo from "./PersonalInfo"
import Skills from "./Skills"
import SocialLinks from "./SocialLinks"
import WorkExperienceInfo from "./WorkExperience"
import { useSession } from "next-auth/react";


export default function ProfessionalProfile() {
  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <PersonalInfo />
        <WorkExperienceInfo />
        <Skills />
        <SocialLinks />
        <EducationInfo />
        <CVPreferences />
      </div>
    </div>
  )
}
