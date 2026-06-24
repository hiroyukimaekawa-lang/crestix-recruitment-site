<?php
$site_url         = defined('CRESTIX_RECRUIT_SITE_URL')
    ? CRESTIX_RECRUIT_SITE_URL
    : 'https://hiroyukimaekawa-lang.github.io/crestix-recruitment-site';
$site_url_display = rtrim(str_replace(['https://', 'http://'], '', $site_url), '/');

$sns_x        = get_option('crestory_sns_x', '');
$sns_facebook = get_option('crestory_sns_facebook', '');
$sns_youtube  = get_option('crestory_sns_youtube', '');

$sidebar_posts = new WP_Query([
    'post_type'           => 'crestory',
    'posts_per_page'      => 3,
    'meta_key'            => 'crestory_featured',
    'meta_value'          => '1',
    'orderby'             => 'date',
    'order'               => 'DESC',
    'ignore_sticky_posts' => true,
]);
if (!$sidebar_posts->have_posts()) {
    wp_reset_postdata();
    $sidebar_posts = new WP_Query([
        'post_type'           => 'crestory',
        'posts_per_page'      => 3,
        'orderby'             => 'date',
        'order'               => 'DESC',
        'ignore_sticky_posts' => true,
    ]);
}
?>
<aside class="note-sidebar site-profile-sidebar" aria-label="サイト情報">
  <div class="note-profile-block">

    <div class="note-profile-head">
      <?php if (has_custom_logo()): ?>
        <?php the_custom_logo(); ?>
      <?php else: ?>
        <span class="note-profile-logo-text" aria-hidden="true">C</span>
      <?php endif; ?>
      <div class="note-profile-name">
        <strong><?php echo esc_html(get_bloginfo('name')); ?></strong>
        <span>by Crestix</span>
      </div>
    </div>

    <p class="note-profile-desc"><?php echo esc_html(get_bloginfo('description')); ?></p>

    <a class="note-profile-url" href="<?php echo esc_url($site_url); ?>" target="_blank" rel="noopener noreferrer">
      <?php echo esc_html($site_url_display); ?>
    </a>

    <div class="note-sns-links">
      <?php if ($sns_x): ?>
        <a class="note-sns-icon" href="<?php echo esc_url($sns_x); ?>" target="_blank" rel="noopener noreferrer" aria-label="X(Twitter)">
          <i class="fa-brands fa-x-twitter" aria-hidden="true"></i>
        </a>
      <?php endif; ?>
      <?php if ($sns_facebook): ?>
        <a class="note-sns-icon" href="<?php echo esc_url($sns_facebook); ?>" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
        </a>
      <?php endif; ?>
      <?php if ($sns_youtube): ?>
        <a class="note-sns-icon" href="<?php echo esc_url($sns_youtube); ?>" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <i class="fa-brands fa-youtube" aria-hidden="true"></i>
        </a>
      <?php endif; ?>
      <a class="note-sns-icon" href="<?php echo esc_url($site_url); ?>" target="_blank" rel="noopener noreferrer" aria-label="公式サイト">
        <i class="fa-solid fa-link" aria-hidden="true"></i>
      </a>
    </div>

    <hr class="note-profile-divider">

    <?php if ($sidebar_posts->have_posts()): ?>
      <div class="note-sidebar-posts">
        <?php while ($sidebar_posts->have_posts()): $sidebar_posts->the_post(); ?>
          <a class="note-sidebar-post" href="<?php the_permalink(); ?>">
            <div class="note-sidebar-thumb">
              <?php if (has_post_thumbnail()): ?>
                <?php the_post_thumbnail('crestory-thumb'); ?>
              <?php elseif ($ogp = crestix_crestory_meta('crestory_ogp_image')): ?>
                <img src="<?php echo esc_url($ogp); ?>" alt="<?php echo esc_attr(get_the_title()); ?>" loading="lazy">
              <?php else: ?>
                <span class="note-thumb-placeholder">CRESTORY</span>
              <?php endif; ?>
            </div>
            <h4 class="note-sidebar-post-title"><?php the_title(); ?></h4>
          </a>
        <?php endwhile; wp_reset_postdata(); ?>
      </div>
    <?php else: ?>
      <?php wp_reset_postdata(); ?>
    <?php endif; ?>

  </div>
</aside>
