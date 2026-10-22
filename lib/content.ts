/**
 * Page copy and people that are not synced from the desktop app.
 *
 * TODO: everything here is placeholder until the gym sends real text and photos.
 * Photos live in public/images/ — replace the files and keep the names, or change
 * the paths here.
 */

export const ABOUT_INTRO =
  "A community-focused gym in Haile Garment for people who want to get stronger, fitter and more consistent, whatever level they start at.";

export const ABOUT_STORY: readonly string[] = [
  "Our story is coming soon. This is placeholder text for how Thrive Gym started and what it stands for.",
  "Here we'll share who we are, why we opened in Meskelegna, and what members can expect when they walk through the door.",
];

export const VALUES: ReadonlyArray<{ icon: string; title: string; body: string }> = [
  {
    icon: "groups",
    title: "Everyone welcome",
    body: "Beginners and regulars train side by side. Nobody is too new to start.",
  },
  {
    icon: "fitness_center",
    title: "Real training",
    body: "Proper equipment and real guidance. The basics, done well.",
  },
  {
    icon: "bolt",
    title: "Consistency",
    body: "Open every day, so the habit is easy to keep.",
  },
];

export interface StaffMember {
  name: string;
  role: string;
  photo: string;
}

export const STAFF: readonly StaffMember[] = [
  { name: "Staff Name", role: "Manager", photo: "/images/staff-1.jpg" },
  { name: "Staff Name", role: "Head Coach", photo: "/images/staff-2.jpg" },
  { name: "Staff Name", role: "Coach", photo: "/images/staff-3.jpg" },
  { name: "Staff Name", role: "Front Desk", photo: "/images/staff-4.jpg" },
];
