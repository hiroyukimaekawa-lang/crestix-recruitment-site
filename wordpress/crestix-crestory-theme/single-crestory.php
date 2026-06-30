<?php
get_header();
the_post();

$term     = crestix_crestory_first_term();
$yt_url   = crestix_crestory_meta('crestory_youtube_url');
$yt_embed = $yt_url ? crestory_get_youtube_embed($yt_url) : '';
?>
<main class="crestory-page note-layout" id="cx-main">
  <div class="note-wrapper">

    <div class="note-main">
      <article class="crestory-single">

        <?php if (has_post_thumbnail()): ?>
          <div class="crestory-single-thumb">
            <?php the_post_thumbnail('crestory-hero'); ?>
          </div>
        <?php endif; ?>

        <div class="crestory-single-header crestory-container">
          <?php if ($term): ?>
            <div class="crestory-single-cat">
              <a href="<?php echo esc_url(get_term_link($term)); ?>"><?php echo esc_html($term->name); ?></a>
            </div>
          <?php endif; ?>
          <h1 class="crestory-single-title"><?php the_title(); ?></h1>
          <div class="crestory-single-meta">
            <time datetime="<?php echo esc_attr(get_the_date('c')); ?>"><?php echo esc_html(get_the_date('Y.m.d')); ?></time>
          </div>
        </div>

        <?php if ($yt_embed): ?>
          <div class="entry-youtube-embed crestory-container">
            <iframe src="<?php echo esc_url($yt_embed); ?>?rel=0"
                    title="<?php echo esc_attr(get_the_title()); ?>"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen></iframe>
          </div>
        <?php endif; ?>

        <div class="crestory-article-body crestory-container">
          <?php the_content(); ?>
        </div>

        <?php $tags = crestix_crestory_tag_terms(); if ($tags): ?>
          <div class="crestory-article-tags crestory-container">
            <?php foreach ($tags as $tag): ?>
              <span>#<?php echo esc_html($tag->name); ?></span>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>

      </article>

      <?php
      $related_args = [
          'post_type'      => 'crestory',
          'posts_per_page' => 3,
          'post__not_in'   => [get_the_ID()],
      ];
      if ($term) {
          $related_args['tax_query'] = [[
              'taxonomy' => 'crestory_category',
              'field'    => 'term_id',
              'terms'    => [$term->term_id],
          ]];
      }
      $related = new WP_Query($related_args);
      if ($related->have_posts()):
      ?>
        <section class="crestory-related crestory-container">
          <h2>関連記事</h2>
          <div class="crestory-grid">
            <?php while ($related->have_posts()): $related->the_post();
              get_template_part('template-parts/card', 'crestory');
            endwhile; wp_reset_postdata(); ?>
          </div>
        </section>
      <?php endif; ?>

      <section class="crestory-entry-cta crestory-container">
        <h2>Crestixで、自分史上最高を更新しませんか？</h2>
        <p>少しでも気になった方は、まずは一度お話ししましょう。</p>
        <div class="crestory-cta-buttons">
          <a href="<?php echo esc_url(crestix_crestory_recruit_url('entry.html')); ?>">ENTRY</a>
          <a href="<?php echo esc_url(crestix_crestory_recruit_url('jobs.html')); ?>" class="is-outline">募集職種を見る</a>
        </div>
      </section>
    </div>

    <?php get_sidebar('right'); ?>

  </div>
</main>
<?php get_footer(); ?>
