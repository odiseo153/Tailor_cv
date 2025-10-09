"use client"

import EducationInfo from "./EducationInfoOptimized";
//import CVPreference from "./Preference";
import PersonalInfo from "./PersonalInfoOptimized";
import Skills from "./SkillsOptimized";
import SocialLinks from "./SocialLinksOptimized";
import WorkExperienceInfo from "./WorkExperienceOptimized";


export default function ProfessionalProfile() {


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <PersonalInfo />
        <WorkExperienceInfo />
        <Skills />
        <SocialLinks />
        <EducationInfo />  
      </div>
    </div>
  )
}
