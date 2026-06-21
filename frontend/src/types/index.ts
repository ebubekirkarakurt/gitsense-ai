export interface Project {
  id: string;
  name: string;
  color: string;
  starred?: boolean;
}

export interface Analysis {
  id: string;
  title: string;
  timeAgo: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}