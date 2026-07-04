<?php
get_header();
the_post();

$term     = crestix_crestory_first_term();
$yt_url   = crestix_crestory_meta('crestory_youtube_url');
$yt_embed = $yt_url ? crestory_get_youtube_embed($yt_url) : '';
$show_member_cta = has_term('メンバー', 'crestory_category', get_the_ID());
$member_cta_name = trim((string) crestix_crestory_meta('crestory_author_name'));
$member_cta_title = trim((string) crestix_crestory_meta('crestory_author_title'));
$member_profile_source = wp_strip_all_tags(get_the_content(null, false, get_the_ID()));

if (!$member_cta_name || in_array($member_cta_name, ['Crestix編集部', '採用広報'], true)) {
  if (preg_match('/プロフィール\s*([^\r\n｜|]+?)\s*[｜|]\s*([^\r\n]+)/u', $member_profile_source, $matches)) {
    $member_cta_name = trim($matches[1]);
    $member_cta_title = $member_cta_title ?: trim($matches[2]);
  }
}

if (!$member_cta_name) {
  foreach (['西田 翔', '前川 弘行', '松岡 龍士', '髙原 一真', '高原 一真', '魚井 風太', '水柿 裕香', '縞谷 廉史'] as $candidate_name) {
    if (strpos(get_the_title() . $member_profile_source, $candidate_name) !== false) {
      $member_cta_name = $candidate_name;
      break;
    }
  }
}

$member_cta_label = $member_cta_name ? $member_cta_name . 'とカジュアル面談を申し込む' : 'カジュアル面談に申し込む';
$member_cta_url = add_query_arg(
  array_filter([
    'member' => $member_cta_name,
    'title'  => $member_cta_title,
    'source' => get_permalink(),
  ]),
  crestix_crestory_recruit_url('casual-entry.html')
);
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
              <a href="<?php echo esc_url(crestix_crestory_category_home_url($term)); ?>"><?php echo esc_html($term->name); ?></a>
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
<?php if ($show_member_cta): ?>
  <a class="crestory-floating-casual-cta"
     href="<?php echo esc_url($member_cta_url); ?>"
     aria-label="<?php echo esc_attr($member_cta_label); ?>">
    <?php echo esc_html($member_cta_label); ?>
  </a>
<?php endif; ?>
<?php get_footer(); ?>
