import { notFound } from 'next/navigation'
import { getLessonBySlug, getSections, getAllLessons } from '@/lib/content'
import { LessonLayout } from '@/components/LessonLayout'

export function generateStaticParams() {
  const lessons = getAllLessons()
  return lessons.map((lesson) => ({ slug: lesson.slug }))
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lesson = getLessonBySlug(slug)
  if (!lesson) notFound()

  const sections = getSections()

  return <LessonLayout lesson={lesson} sections={sections.sections} />
}
