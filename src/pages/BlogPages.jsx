import { posts } from '../data/posts'
import { formatDate } from '../data/dates'
import { Reveal } from '../components/Reveal'
import Link from '../components/Link'
import { navigate } from '../router'

function PostMeta({ post }) {
  return (
    <p className="blog__meta mono">
      {post.draft && <span className="blog__draft">Draft</span>}
      {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
      <span>{post.minutes} min read</span>
    </p>
  )
}

export function BlogIndexPage() {
  return (
    <section className="section page">
      <div className="container">
        <Reveal className="page__header">
          <Link to="/" className="page__back mono">← back home</Link>
          <p className="mono kicker">blog</p>
          <h1 className="page__title">
            The <span className="gradient-text">workbench</span>
          </h1>
          <p className="section-lead">Notes on what I'm building, fixing, and learning, written as I go.</p>
        </Reveal>

        {posts.length === 0 ? (
          <p className="muted">No posts yet. Check back soon.</p>
        ) : (
          <ul className="blog__list">
            {posts.map((post, i) => (
              <Reveal as="li" key={post.slug} delay={Math.min(i, 4) * 60}>
                <Link to={`/blog/${post.slug}`} className="blog__card">
                  <PostMeta post={post} />
                  <h2 className="blog__card-title">{post.title}</h2>
                  {post.description && <p className="blog__card-desc">{post.description}</p>}
                  {post.tags.length > 0 && (
                    <ul className="tags">
                      {post.tags.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export function BlogPostPage({ post }) {
  const i = posts.indexOf(post)
  const newer = posts[i - 1]
  const older = posts[i + 1]

  // Links inside the post to pages on this site open without a full reload.
  const onClick = (e) => {
    const a = e.target.closest('a')
    const href = a?.getAttribute('href')
    if (!href || !href.startsWith('/') || href.startsWith('//') || e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    navigate(href)
  }

  return (
    <section className="section page">
      <div className="container">
        <Reveal className="page__header">
          <Link to="/blog" className="page__back mono">← all posts</Link>
          <PostMeta post={post} />
          <h1 className="page__title blog__title">{post.title}</h1>
          {post.description && <p className="section-lead">{post.description}</p>}
          {post.tags.length > 0 && (
            <ul className="tags">
              {post.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </Reveal>

        {post.image && <img className="project__image" src={post.image} alt="" />}

        <article className="prose blog__body" onClick={onClick} dangerouslySetInnerHTML={{ __html: post.html }} />

        {(newer || older) && (
          <nav className="blog__pager" aria-label="More posts">
            {older ? (
              <Link to={`/blog/${older.slug}`} className="blog__pager-link">
                <span className="mono">← older</span>
                {older.title}
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link to={`/blog/${newer.slug}`} className="blog__pager-link blog__pager-link--next">
                <span className="mono">newer →</span>
                {newer.title}
              </Link>
            )}
          </nav>
        )}
      </div>
    </section>
  )
}
