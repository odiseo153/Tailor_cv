"use client"

import CVPreferences from "./CVPreferences"
import EducationInfo from "./EducationInfo"
import PersonalInfo from "./PersonalInfo"
import Skills from "./Skills"
import SocialLinks from "./SocialLinks"
import WorkExperienceInfo from "./WorkExperience"
import { useAppContext } from "@/app/layout/AppContext"

export default function ProfessionalProfile() {
  const {user} = useAppContext();

  if(!user){
    window.location.href = '/';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <PersonalInfo  />
        <WorkExperienceInfo  />
        <Skills/>
        <EducationInfo  />
        <CVPreferences  />
      </div>
    </div>
  )
}

