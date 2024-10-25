import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import ResumeView from './resumeView';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Types remain the same as in your original code
interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
}

interface WorkExperience {
  jobTitle: string;
  companyName: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  grade: string;
}

interface Skill {
  category: string;
  skills: string;
}

interface Project {
  projectName: string;
  description: string;
  link: string;
}

interface Language {
  language: string;
  proficiency: string;
}

interface Certification {
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
}

interface ResumeData {
  personalDetails: PersonalDetails;
  objective: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  languages: Language[];
  certifications: Certification[];
}

async function getResumeData(resumeId: string): Promise<ResumeData | null> {
  const session = await getServerSession(authOptions);
  try {
    const userId = session?.user?.email;
    const resumeRef = doc(db, `users/${userId}/resumes/${resumeId}`);
    const resumeSnap = await getDoc(resumeRef);
    
    if (!resumeSnap.exists()) {
      return null;
    }
    
    return resumeSnap.data() as ResumeData;
  } catch (error) {
    console.error('Error fetching resume:', error);
    return null;
  }
}

export default async function Page({
  params: { resumeId },
}: {
  params: { resumeId: string };
}) {
  const resumeData = await getResumeData(resumeId);
  const session = await getServerSession(authOptions);

  if (!resumeData) {
    return (
      <div className="p-8 text-center dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">No resume data found</p>
        <p className="text-sm text-gray-500">ID: {resumeId}</p>
        <p className="text-sm text-gray-500">User: {session?.user?.email}</p>
      </div>
    );
  }

  return <ResumeView resumeData={resumeData} resumeId={resumeId} />;
}