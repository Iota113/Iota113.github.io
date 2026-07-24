import animeAwardsImg from '../../images/projects/anime-awards.webp';
import sandroneImg from '../../images/projects/sandrone.webp';
import swapCalculatorImg from '../../images/projects/swap-calculator.webp';

export interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  websiteUrl?: string;
  github: {
    owner: string;
    repo: string;
  };
  showcaseImage?: string;
}

export const projects: Project[] = [
  {
    id: 'nuscas-anime-awards',
    name: 'NUSCAS Anime Awards',
    description:
      'A site for club members to vote for their favorite series and showcases the final winners in an interactive format.',
    tags: ['JavaScript', 'Google Apps Script'],
    websiteUrl: "https://markneoneo.github.io/NUSCAS-Anime-Awards/",
    github: {
      owner: 'Markneoneo',
      repo: 'NUSCAS-Anime-Awards',
    },
    showcaseImage: animeAwardsImg
  },
  {
    id: 'sandrone',
    name: 'Sandrone',
    description:
      'A task management chatbot inspired by the epoynomous character from Genshin Impact.',
    tags: ['Java', 'Gradle'],
    websiteUrl: 'https://iota113.github.io/Sandrone/',
    github: {
      owner: 'Iota113',
      repo: 'Sandrone',
    },
    showcaseImage: sandroneImg
  },
  {
    id: 'swap-calculator',
    name: 'Swap Calculator',
    description:
      'A web app for building swap curves and calculating financial data like deltas and projected cashflow.',
    tags: ['Python', 'JavaScript', 'Render'],
    websiteUrl: 'https://interest-rate-calculator-dgu1.onrender.com/',
    github: {
      owner: 'podledges',
      repo: 'Swap-Calculator',
    },
    showcaseImage: swapCalculatorImg
  },
];
