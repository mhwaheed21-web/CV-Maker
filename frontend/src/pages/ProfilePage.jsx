import { useEffect, useState } from 'react'
import { getFullProfile } from '../api/profile'
import useProfileStore from '../store/profileStore'
import PersonalInfoForm from '../components/profile/PersonalInfoForm'
import WorkExperienceForm from '../components/profile/WorkExperienceForm'
import EducationForm from '../components/profile/EducationForm'
import SkillsForm from '../components/profile/SkillsForm'
import ProjectsForm from '../components/profile/ProjectsForm'
import CertificationsForm from '../components/profile/CertificationsForm'

function Section({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="surface-card mb-4 overflow-hidden">
      <button
        className="flex w-full items-center justify-between border-b border-ubuntu-border bg-ubuntu-surfaceAlt px-5 py-4 text-left text-base font-semibold text-ubuntu-text transition-all duration-250 ease-in-out hover:border-brand-500/40"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <span className="text-xs text-brand-300">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  )
}

export default function ProfilePage() {
  const { profile, setProfile } = useProfileStore()
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getFullProfile()
      .then((res) => setProfile(res.data))
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [])

  if (fetching) {
    return (
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="surface-card animate-pulse p-6">
          <div className="mb-4 h-6 w-40 rounded bg-ubuntu-surfaceAlt" />
          <div className="mb-6 h-4 w-72 rounded bg-ubuntu-surfaceAlt" />
          <div className="space-y-3">
            <div className="h-12 rounded-xl2 bg-ubuntu-surfaceAlt" />
            <div className="h-12 rounded-xl2 bg-ubuntu-surfaceAlt" />
            <div className="h-28 rounded-xl2 bg-ubuntu-surfaceAlt" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-ubuntu-text">My Profile</h2>
        <p className="mt-2 text-sm text-ubuntu-muted">
          Fill in your information. This is what the AI uses to generate your CVs.
        </p>
      </div>

      <Section title="Personal Information">
        <PersonalInfoForm data={profile?.personal} />
      </Section>

      <Section title="Work Experience">
        <WorkExperienceForm data={profile?.experience} />
      </Section>

      <Section title="Education">
        <EducationForm data={profile?.education} />
      </Section>

      <Section title="Skills">
        <SkillsForm data={profile?.skills} />
      </Section>

      <Section title="Projects">
        <ProjectsForm data={profile?.projects} />
      </Section>

      <Section title="Certifications">
        <CertificationsForm data={profile?.certifications} />
      </Section>
    </div>
  )
}