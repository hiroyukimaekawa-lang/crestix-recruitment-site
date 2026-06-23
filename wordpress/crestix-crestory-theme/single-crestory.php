<?php get_header(); the_post(); $term = crestix_crestory_first_term(); ?>
<main class="crestory-single">
  <article>
    <header class="crestory-single-hero crestory-container">
      <nav class="crestory-breadcrumb"><a href="<?php echo esc_url(home_url("/")); ?>">CRESTORY</a><span>/</span><span><?php the_title(); ?></span></nav>
      <?php if ($term): ?><span class="crestory-card-category"><?php echo esc_html($term->name); ?></span><?php endif; ?>
      <h1><?php the_title(); ?></h1>
      <?php $lead = crestix_crestory_meta("crestory_lead") ?: get_the_excerpt(); if ($lead): ?><p class="crestory-single-lead"><?php echo esc_html($lead); ?></p><?php endif; ?>
      <div class="crestory-single-meta">
        <span><?php echo esc_html(crestix_crestory_meta("crestory_author_name") ?: get_the_author()); ?></span>
        <?php $author_title = crestix_crestory_meta("crestory_author_title"); if ($author_title): ?><span class="crestory-author-title"><?php echo esc_html($author_title); ?></span><?php endif; ?>
        <time><?php echo esc_html(get_the_date("Y.m.d")); ?></time>
      </div>
      <?php if (has_post_thumbnail()): ?><div class="crestory-single-image"><?php the_post_thumbnail("crestory-hero"); ?></div><?php else: ?><div class="crestory-single-image crestory-placeholder"><span>CRESTORY</span></div><?php endif; ?>
    </header>
    <div class="crestory-article-body crestory-container"><?php the_content(); ?></div>
    <?php $tags = crestix_crestory_tag_terms(); if ($tags): ?>
      <div class="crestory-article-tags crestory-container">
        <?php foreach ($tags as $tag): ?><span>#<?php echo esc_html($tag->name); ?></span><?php endforeach; ?>
      </div>
    <?php endif; ?>
  </article>

  <section class="crestory-entry-cta crestory-container">
    <h2>Crestixで、自分史上最高を更新しませんか？</h2>
    <p>少しでも気になった方は、まずは一度お話ししましょう。</p>
    <div class="crestory-cta-buttons">
      <a href="<?php echo esc_url(crestix_crestory_recruit_url("entry.html")); ?>">ENTRY</a>
      <a href="<?php echo esc_url(crestix_crestory_recruit_url("jobs.html")); ?>" class="is-outline">採用情報を見る</a>
    </div>
  </section>

  <section class="crestory-related crestory-container"><h2>関連記事</h2><div class="crestory-grid">
    <?php
    $related_args = ["post_type"=>"crestory", "posts_per_page"=>3, "post__not_in"=>[get_the_ID()]];
    if ($term) {
      $related_args["tax_query"] = [[
        "taxonomy" => "crestory_category",
        "field" => "term_id",
        "terms" => [$term->term_id],
      ]];
    }
    $related = new WP_Query($related_args);
    if ($related->have_posts()): while ($related->have_posts()): $related->the_post(); get_template_part("template-parts/card", "crestory"); endwhile; wp_reset_postdata(); else: ?><p class="crestory-empty">関連記事はまだありません。</p><?php endif; ?>
  </div></section>
</main>
<?php get_footer(); ?>
