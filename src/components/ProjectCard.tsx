import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, Star, GitFork, Scale, Github } from 'lucide-react';
import type { Project } from '../data/projects';

interface GitHubRepoData {
  description: string;
  stargazers_count: number;
  forks_count: number;
  license: { spdx_id: string } | null;
  owner: {
    avatar_url: string;
  };
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toString();
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

const KNOWN_TAGS = ['javascript', 'python', 'google-apps-script', 'render', 'java', 'gradle'];

const getTagClassName = (tag: string) => {
  const normalized = tag.toLowerCase().trim().replace(/\s+/g, '-');
  if (KNOWN_TAGS.includes(normalized)) {
    return `tag-${normalized}`;
  }
  return 'tag-badge';
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const [repo, setRepo] = useState<GitHubRepoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { owner, repo: repoName } = project.github;
    fetch(`https://api.github.com/repos/${owner}/${repoName}`)
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        return res.json();
      })
      .then((data) => setRepo(data))
      .catch((err) => console.error(`Failed to fetch ${owner}/${repoName}:`, err))
      .finally(() => setLoading(false));
  }, [project.github]);

  const stars = repo?.stargazers_count;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.2, 1, 0.3, 1],
      }}
      whileHover={{ y: -6 }}
      style={{ borderRadius: 'var(--radius-ui)' }}
      className="project-card group relative flex flex-col bg-[var(--color-surface-bg)] border border-[var(--color-border)] overflow-hidden transition-all duration-500"
    >
      {/* ─── Section 1: Header — Tags + Website Link ─── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className={`inline-block px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-[0.12em] border rounded-sm transition-all duration-300 ${getTagClassName(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {project.websiteUrl && (
          <a
            href={project.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="project-website-link flex-shrink-0 ml-2 opacity-40 hover:opacity-100 transition-opacity duration-300"
            aria-label={`Visit ${project.name} website`}
          >
            <Globe size={18} strokeWidth={1.5} />
          </a>
        )}
      </div>

      {/* ─── Section 2: Title + Description */}
      <div className="px-5 pt-1">
        <h2 className="text-xl md:text-2xl font-serif font-bold tracking-tight mb-1.5 text-[var(--color-natural-text)] transition-colors duration-500">
          {project.name}
        </h2>
        <p className="text-xs leading-relaxed text-[var(--color-text-muted)] mb-3 transition-colors duration-500">
          {project.description}
        </p>
      </div>

      {/* ─── Section 3: Embedded GitHub Repo Card ─── */}
      <div className="px-5 pb-4">
        <a
          href={`https://github.com/${project.github.owner}/${project.github.repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="github-embed-card block border rounded-lg p-3 transition-all duration-300 hover:shadow-md group/gh"
        >
          {loading ? (
            /* Skeleton loader */
            <div className="animate-pulse space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[var(--color-border)]" />
                <div className="h-3 w-32 rounded bg-[var(--color-border)]" />
              </div>
              <div className="h-2.5 w-full rounded bg-[var(--color-border)]" />
              <div className="flex gap-4">
                <div className="h-2.5 w-10 rounded bg-[var(--color-border)]" />
                <div className="h-2.5 w-10 rounded bg-[var(--color-border)]" />
              </div>
            </div>
          ) : repo ? (
            <>
              {/* Repo header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={repo.owner.avatar_url}
                    alt={`${project.github.owner} avatar`}
                    className="w-5 h-5 rounded-full flex-shrink-0"
                  />
                  <span className="text-xs truncate">
                    <span className="opacity-60">{project.github.owner}</span>
                    <span className="opacity-40 mx-0.5">/</span>
                    <span className="font-bold">{project.github.repo}</span>
                  </span>
                </div>
                <Github size={16} className="flex-shrink-0 opacity-30 group-hover/gh:opacity-70 transition-opacity" />
              </div>

              {/* Repo description */}
              <p className="text-[11px] leading-relaxed opacity-60 mb-2.5">
                {repo.description}
              </p>

              {/* Repo stats */}
              <div className="flex items-center gap-4 text-[11px] opacity-50">
                <span className="flex items-center gap-1">
                  <Star size={11} /> {formatCount(repo.stargazers_count)}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork size={11} /> {formatCount(repo.forks_count)}
                </span>
                {repo.license && (
                  <span className="flex items-center gap-1">
                    <Scale size={11} /> {repo.license.spdx_id}
                  </span>
                )}
              </div>
            </>
          ) : (
            /* Error fallback */
            <div className="flex items-center gap-2">
              <Github size={16} className="opacity-40" />
              <span className="text-xs opacity-50">
                {project.github.owner}/{project.github.repo}
              </span>
            </div>
          )}
        </a>
      </div>

      {/* ─── Section 4: Image Showcase ─── */}
      <div className="px-5 pb-5 mt-auto">
        {project.showcaseImage ? (
          <div
            className="w-full aspect-[16/10] rounded-lg overflow-hidden border border-[var(--color-border)] transition-colors duration-500"
          >
            <img
              src={project.showcaseImage}
              alt={`${project.name} showcase`}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            />
          </div>
        ) : (
          <div
            className="project-image-placeholder w-full aspect-[16/10] rounded-lg border border-dashed flex items-center justify-center transition-colors duration-500"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-30">
              Screenshot coming soon
            </span>
          </div>
        )}
      </div>
    </motion.article>
  );
};
