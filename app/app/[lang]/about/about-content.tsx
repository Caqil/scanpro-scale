"use client";

import Image from "next/image";
import { 
  BookOpen, 
  Target, 
  Globe, 
  Award, 
  Rocket, 
  Users, 
  Heart, 
  Shield, 
  Lightbulb 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";

const TeamMember = ({ 
  name, 
  role, 
  image, 
  quote 
}: { 
  name: string, 
  role: string, 
  image: string, 
  quote: string 
}) => (
  <div className="bg-background border rounded-lg p-6 flex flex-col items-center text-center">
    <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-primary/20">
      <Image 
        src={image} 
        alt={name} 
        width={96} 
        height={96} 
        className="w-full h-full object-cover"
      />
    </div>
    <h3 className="text-lg font-semibold">{name}</h3>
    <p className="text-muted-foreground mb-3">{role}</p>
    <p className="text-sm italic text-muted-foreground">"{quote}"</p>
  </div>
);

export default function AboutPageContent() {
  const { t } = useLanguageStore();
  
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="mb-6 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 inline-block">
          <BookOpen className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          {t('about.hero.title') || "Empowering Digital Document Management"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('about.hero.description') || "ScanPro was born from a simple idea: making document management seamless, efficient, and accessible to everyone. We believe in transforming how people interact with digital documents."}
        </p>
      </section>

      {/* Our Story */}
      <section className="mb-16 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">{t('about.story.title') || "Our Story"}</h2>
          <p className="text-muted-foreground mb-4">
            {t('about.story.paragraph1') || "Founded in 2022, ScanPro emerged from the frustration of dealing with complex and unintuitive PDF tools. Our founders, tech enthusiasts and document management experts, saw an opportunity to create a solution that was both powerful and user-friendly."}
          </p>
          <p className="text-muted-foreground">
            {t('about.story.paragraph2') || "What started as a small project quickly grew into a comprehensive platform serving thousands of users worldwide, from students and professionals to large enterprises."}
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-xl -rotate-6"></div>
          <Image 
            src="/images/ic_icon.png" 
            alt="ScanPro Team" 
            width={600} 
            height={400} 
            className="relative rounded-xl shadow-lg z-10 transform rotate-3"
          />
        </div>
      </section>

      {/* Mission and Values */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t('about.missionValues.title') || "Our Mission and Values"}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="p-3 rounded-full bg-primary/10 inline-block mb-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('about.missionValues.mission.title') || "Mission"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('about.missionValues.mission.description') || "To simplify digital document management by providing intuitive, powerful, and accessible PDF tools that enhance productivity and creativity."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 inline-block mb-3">
                <Heart className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle>{t('about.missionValues.customerFirst.title') || "Customer First"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('about.missionValues.customerFirst.description') || "We prioritize user experience and continuously improve our tools based on real user feedback. Your needs drive our innovation."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 inline-block mb-3">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle>{t('about.missionValues.privacy.title') || "Privacy & Security"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('about.missionValues.privacy.description') || "We are committed to protecting your data with state-of-the-art security measures and absolute respect for your privacy."}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Values */}
      <section className="mb-16 bg-muted/20 rounded-xl p-12">
        <h2 className="text-3xl font-bold text-center mb-12">{t('about.coreValues.title') || "Our Core Values"}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <Lightbulb className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('about.coreValues.innovation.title') || "Innovation"}</h3>
            <p className="text-muted-foreground">
              {t('about.coreValues.innovation.description') || "We continuously push the boundaries of what's possible in document management."}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('about.coreValues.collaboration.title') || "Collaboration"}</h3>
            <p className="text-muted-foreground">
              {t('about.coreValues.collaboration.description') || "We believe in the power of teamwork, both within our company and with our users."}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Globe className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('about.coreValues.accessibility.title') || "Accessibility"}</h3>
            <p className="text-muted-foreground">
              {t('about.coreValues.accessibility.description') || "Our tools are designed to be simple, intuitive, and available to everyone."}
            </p>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{t('about.team.title') || "Meet Our Team"}</h2>
        <p className="mb-8 text-muted-foreground">
          {t('about.team.description') || "ScanPro is powered by a small, dedicated team focused on creating the best possible PDF tools for our users."}
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="h-32 w-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/60 dark:to-blue-800/60 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">C</span>
            </div>
            <h3 className="text-xl font-bold">{t('about.team.member1.name') || "Cakra"}</h3>
            <p className="text-primary">{t('about.team.member1.role') || "App Development Lead"}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('about.team.member1.bio') || "Oversees the development of our applications, implementing robust backend solutions and ensuring our tools work smoothly and efficiently."}
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-32 w-32 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/60 dark:to-green-800/60 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">A</span>
            </div>
            <h3 className="text-xl font-bold">{t('about.team.member2.name') || "Abdi"}</h3>
            <p className="text-primary">{t('about.team.member2.role') || "Frontend Web Developer"}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('about.team.member2.bio') || "Creates the user interfaces that make our tools intuitive and accessible, focusing on delivering exceptional user experiences across all our web platforms."}
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-32 w-32 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/60 dark:to-purple-800/60 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">A</span>
            </div>
            <h3 className="text-xl font-bold">{t('about.team.member3.name') || "Anggi"}</h3>
            <p className="text-primary">{t('about.team.member3.role') || "Marketing Specialist"}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('about.team.member3.bio') || "Leads our marketing efforts to connect our tools with the people who need them, building awareness and driving the growth of our platform."}
            </p>
          </div>
        </div>
      </section>

   {/* Milestones */}
   <section className="mb-16 bg-primary/5 rounded-xl p-12">
        <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-primary">2022</h3>
            <p className="text-muted-foreground">Company Founded</p>
          </div>
          <div className="text-center">
            <Award className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-yellow-500">2023</h3>
            <p className="text-muted-foreground">100,000 Users Milestone</p>
          </div>
          <div className="text-center">
            <Globe className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-500">2023</h3>
            <p className="text-muted-foreground">Expanded International Presence</p>
          </div>
          <div className="text-center">
            <Lightbulb className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-purple-500">2024</h3>
            <p className="text-muted-foreground">Advanced AI Features Launched</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-6">Join Our Journey</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Whether you're a student, professional, or enterprise, ScanPro is here to 
          transform your document management experience.
        </p>
        <div className="flex justify-center gap-4">
          <LanguageLink href="/pdf-tools">
            <Button variant="default" size="lg">
              Explore Our Tools
            </Button>
          </LanguageLink>
          <LanguageLink href="/contact">
            <Button variant="outline" size="lg">
              Contact Us
            </Button>
          </LanguageLink>
        </div>
      </section>
    </div>
  );
}