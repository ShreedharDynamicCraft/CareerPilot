"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUser } from "@/actions/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    industry: "",
    experience: "",
    skills: "",
    bio: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert skills string to array
      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      await updateUser({
        ...formData,
        skills: skillsArray,
        experience: parseInt(formData.experience) || 0,
      });

      toast.success("Profile updated successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome to CareerPilot</h1>
          <p className="text-gray-600">
            Let's set up your profile to get started with your career journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              placeholder="e.g., Technology, Healthcare, Finance"
              value={formData.industry}
              onChange={(e) =>
                setFormData({ ...formData, industry: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              type="number"
              placeholder="e.g., 2"
              value={formData.experience}
              onChange={(e) =>
                setFormData({ ...formData, experience: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              placeholder="e.g., JavaScript, Python, React"
              value={formData.skills}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              placeholder="Tell us about yourself"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
} 