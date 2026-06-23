<?php
get_header();
?>
<main class="crestory-page">
  <section class="crestory-tax-hero">
    <div class="crestory-container">
      <p class="crestory-kicker">CRESTORY Archive</p>
      <h1><?php the_archive_title(); ?></h1>
    </div>
  </section>
  <section class="crestory-content">
    <div class="crestory-container">
      <div class="crestory-grid">
        <?php if (have_posts()): while (have_posts()): the_post(); ?>
          <?php get_template_part("template-parts/card", "crestory"); ?>
        <?php endwhile; else: ?>
          <p class="crestory-empty">記事はまだありません。</p>
        <?php endif; ?>
      </div>
      <div class="crestory-pagination"><?php the_posts_pagination(); ?></div>
    </div>
  </section>
</main>
<?php get_footer(); ?>
