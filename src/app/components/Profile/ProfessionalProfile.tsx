"use client"

//import CVPreference from "./Preference";
import EducationInfo from "./EducationInfo";
import PersonalInfo from "./PersonalInfo";
import Skills from "./Skills";
import SocialLinks from "./SocialLinks";
import WorkExperienceInfo from "./WorkExperience";


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
