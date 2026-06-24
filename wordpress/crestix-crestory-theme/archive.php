<?php get_header(); ?>
<main class="crestory-page note-layout">
  <div class="note-wrapper">
    <?php get_sidebar('left'); ?>

    <div class="note-main">
      <?php get_template_part('template-parts/hero'); ?>

      <section class="note-articles-section">
        <header class="note-archive-head">
          <p class="note-source-label">
            <i class="fa-regular fa-bookmark" aria-hidden="true"></i>
            CRESTORY Archive
          </p>
          <h1><?php the_archive_title(); ?></h1>
        </header>

        <div class="note-grid">
          <?php if (have_posts()): while (have_posts()): the_post(); ?>
            <?php get_template_part('template-parts/card', 'crestory'); ?>
          <?php endwhile; else: ?>
            <p class="crestory-empty">記事はまだありません。</p>
          <?php endif; ?>
        </div>

        <div class="note-pagination"><?php the_posts_pagination(); ?></div>
      </section>
    </div>
  </div>
</main>
<?php get_footer(); ?>
