<?php get_header(); $term = get_queried_object(); ?>
<main class="crestory-page">
  <section class="crestory-hero crestory-tax-hero">
    <div class="crestory-container">
      <p class="crestory-kicker">CRESTORY Category</p>
      <h1><?php echo esc_html($term->name); ?></h1>
      <?php if (!empty($term->description)): ?><p class="crestory-hero-copy"><?php echo esc_html($term->description); ?></p><?php endif; ?>
    </div>
  </section>
  <section class="crestory-content crestory-container">
    <aside class="crestory-tabs">
      <a href="<?php echo esc_url(home_url("/")); ?>">すべて</a>
      <?php foreach (["代表メッセージ", "メンバー", "カルチャー", "事業", "インタビュー", "採用情報"] as $label): $cat = get_term_by("name", $label, "crestory_category"); if ($cat): ?>
        <a class="<?php echo $cat->term_id === $term->term_id ? "is-active" : ""; ?>" href="<?php echo esc_url(get_term_link($cat)); ?>"><?php echo esc_html($cat->name); ?></a>
      <?php endif; endforeach; ?>
    </aside>
    <div class="crestory-grid">
      <?php if (have_posts()): while (have_posts()): the_post(); get_template_part("template-parts/card", "crestory"); endwhile; else: ?><p class="crestory-empty">このカテゴリの記事はまだありません。</p><?php endif; ?>
    </div>
    <div class="crestory-pagination"><?php the_posts_pagination(); ?></div>
  </section>
</main>
<?php get_footer(); ?>
