<?php
$site_url         = 'https://www.crestix.jp/';
$site_url_display = rtrim(str_replace(['https://', 'http://'], '', $site_url), '/');

$sns_x        = get_option('crestory_sns_x', '');
$sns_facebook = get_option('crestory_sns_facebook', '');
$sns_youtube  = get_option('crestory_sns_youtube', '');
?>
<aside class="note-sidebar cx-sidebar-right" aria-label="サイト情報・記事情報">

  <!-- CRESTORY紹介 -->
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
  </div>

  <!-- 新着記事 -->
  <?php
  $recent = new WP_Query([
      'post_type'      => 'crestory',
      'posts_per_page' => 5,
      'orderby'        => 'date',
      'order'          => 'DESC',
      'post__not_in'   => [get_the_ID()],
  ]);
  ?>
  <?php if ($recent->have_posts()): ?>
    <div class="cx-sidebar-section">
      <h3 class="cx-sidebar-heading">新着記事</h3>
      <ul class="cx-sidebar-posts">
        <?php while ($recent->have_posts()): $recent->the_post(); ?>
          <li class="cx-sidebar-post">
            <a href="<?php the_permalink(); ?>">
              <?php if (has_post_thumbnail()): ?>
                <div class="cx-sidebar-thumb"><?php the_post_thumbnail('thumbnail'); ?></div>
              <?php endif; ?>
              <p class="cx-sidebar-post-title"><?php the_title(); ?></p>
            </a>
          </li>
        <?php endwhile; wp_reset_postdata(); ?>
      </ul>
    </div>
  <?php endif; ?>

  <!-- カテゴリ一覧 -->
  <?php
  $categories = get_terms([
      'taxonomy'   => 'crestory_category',
      'hide_empty' => true,
  ]);
  ?>
  <?php if (!is_wp_error($categories) && $categories): ?>
    <div class="cx-sidebar-section">
      <h3 class="cx-sidebar-heading">カテゴリ</h3>
      <ul class="cx-sidebar-cats">
        <?php foreach ($categories as $cat): ?>
          <li>
            <a href="<?php echo esc_url(get_term_link($cat)); ?>">
              <span><?php echo esc_html($cat->name); ?></span>
              <span class="cx-sidebar-cat-count"><?php echo (int) $cat->count; ?></span>
            </a>
          </li>
        <?php endforeach; ?>
      </ul>
    </div>
  <?php endif; ?>

  <!-- おすすめ記事 -->
  <?php
  $featured = new WP_Query([
      'post_type'      => 'crestory',
      'posts_per_page' => 3,
      'meta_key'       => 'crestory_featured',
      'meta_value'     => '1',
      'post__not_in'   => [get_the_ID()],
  ]);
  ?>
  <?php if ($featured->have_posts()): ?>
    <div class="cx-sidebar-section">
      <h3 class="cx-sidebar-heading">おすすめ記事</h3>
      <ul class="cx-sidebar-posts">
        <?php while ($featured->have_posts()): $featured->the_post(); ?>
          <li class="cx-sidebar-post">
            <a href="<?php the_permalink(); ?>">
              <?php if (has_post_thumbnail()): ?>
                <div class="cx-sidebar-thumb"><?php the_post_thumbnail('thumbnail'); ?></div>
              <?php endif; ?>
              <p class="cx-sidebar-post-title"><?php the_title(); ?></p>
            </a>
          </li>
        <?php endwhile; wp_reset_postdata(); ?>
      </ul>
    </div>
  <?php endif; ?>

  <!-- 採用サイト導線 + ENTRYボタン -->
  <div class="cx-sidebar-cta">
    <a class="note-sidebar-cta" href="<?php echo esc_url(crestix_crestory_recruit_url('entry.html')); ?>">
      採用情報を見る
    </a>
    <div class="cx-sidebar-cta-buttons">
      <a class="cx-sidebar-btn cx-sidebar-btn--primary"
         href="<?php echo esc_url(crestix_crestory_recruit_url('entry.html')); ?>">
        ENTRY
      </a>
      <a class="cx-sidebar-btn cx-sidebar-btn--outline"
         href="<?php echo esc_url(crestix_crestory_recruit_url('jobs.html')); ?>">
        募集職種を見る
      </a>
    </div>
  </div>

</aside>
