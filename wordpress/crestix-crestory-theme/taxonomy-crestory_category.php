<?php get_header(); $term = get_queried_object(); ?>
<main class="crestory-page note-layout">
  <div class="note-wrapper">
    <?php get_sidebar('left'); ?>

    <div class="note-main">
      <?php get_template_part('template-parts/hero'); ?>

      <section class="note-articles-section">
        <header class="note-archive-head">
          <p class="note-source-label">
            <i class="fa-regular fa-bookmark" aria-hidden="true"></i>
            CRESTORY Category
          </p>
          <h1><?php echo esc_html($term->name); ?></h1>
          <?php if (!empty($term->description)): ?><p><?php echo esc_html($term->description); ?></p><?php endif; ?>
        </header>

        <aside class="note-category-tabs" aria-label="カテゴリ">
          <a href="<?php echo esc_url(home_url('/')); ?>">すべて</a>
          <?php foreach (["代表メッセージ", "メンバー", "カルチャー", "事業", "インタビュー", "採用情報"] as $label): $cat = get_term_by("name", $label, "crestory_category"); if ($cat): ?>
            <a class="<?php echo $cat->term_id === $term->term_id ? "is-active" : ""; ?>" href="<?php echo esc_url(get_term_link($cat)); ?>"><?php echo esc_html($cat->name); ?></a>
          <?php endif; endforeach; ?>
        </aside>

        <div class="note-grid">
          <?php if (have_posts()): while (have_posts()): the_post(); get_template_part('template-parts/card', 'crestory'); endwhile; else: ?><p class="crestory-empty">このカテゴリの記事はまだありません。</p><?php endif; ?>
        </div>

        <div class="note-pagination"><?php the_posts_pagination(); ?></div>
      </section>
    </div>
  </div>
</main>
<?php get_footer(); ?>
