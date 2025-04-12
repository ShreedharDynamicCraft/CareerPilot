import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const platforms = [
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'indeed', name: 'Indeed' },
  { id: 'internshala', name: 'Internshala' }
]

const experienceLevels = [
  { id: 'internship', name: 'Internship' },
  { id: 'entry', name: 'Entry Level' },
  { id: 'mid', name: 'Mid Level' },
  { id: 'senior', name: 'Senior' }
]

const jobTypes = [
  { id: 'fulltime', name: 'Full-time' },
  { id: 'parttime', name: 'Part-time' },
  { id: 'contract', name: 'Contract' },
  { id: 'remote', name: 'Remote' }
]

export default function JobFilters({ filters, setFilters }) {
  const togglePlatform = (platformId) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(id => id !== platformId)
        : [...prev.platforms, platformId]
    }))
  }

  return (
    <div className="flex flex-wrap gap-6 items-center">
      <div className="space-y-2">
        <Label className="block">Platforms</Label>
        <div className="flex flex-wrap gap-4">
          {platforms.map((platform) => (
            <div key={platform.id} className="flex items-center space-x-2">
              <Checkbox
                id={`platform-${platform.id}`}
                checked={filters.platforms.includes(platform.id)}
                onCheckedChange={() => togglePlatform(platform.id)}
              />
              <Label htmlFor={`platform-${platform.id}`}>{platform.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Experience Level</Label>
        <Select
          value={filters.experience}
          onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Any experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any experience</SelectItem>
            {experienceLevels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Job Type</Label>
        <Select
          value={filters.jobType}
          onValueChange={(value) => setFilters(prev => ({ ...prev, jobType: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any type</SelectItem>
            {jobTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}