import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Stats from '@/components/Stats'
import ToolsGrid from '@/components/ToolsGrid'

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Stats />
      <ToolsGrid />
      <Features />
    </div>
  )
}
