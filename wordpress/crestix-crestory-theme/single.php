<?php
if (get_post_type() === "crestory") {
  get_template_part("single", "crestory");
  return;
}
get_header();
?>
<main class="crestory-single">
  <?php while (have_posts()): the_post(); ?>
    <article class="crestory-container crestory-article-body">
      <h1><?php the_title(); ?></h1>
      <?php the_content(); ?>
    </article>
  <?php endwhile; ?>
</main>
<?php get_footer(); ?>
