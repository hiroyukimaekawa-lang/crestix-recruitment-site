<?php
$site_url         = 'https://www.crestix.jp/';
$site_url_display = rtrim(str_replace(['https://', 'http://'], '', $site_url), '/');

$sns_x        = get_option('crestory_sns_x', '');
$sns_facebook = get_option('crestory_sns_facebook', '');
$sns_youtube  = get_option('crestory_sns_youtube', '');
?>
<aside class="note-sidebar" aria-label="サイト情報">
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

    <a class="note-sidebar-cta" href="<?php echo esc_url(crestix_crestory_recruit_url('entry.html')); ?>">
      採用情報を見る
    </a>

    <hr class="note-profile-divider">

    <!-- サイドバー下部：YouTube カテゴリ記事リスト -->
    <div class="sidebar-youtube">
      <h3 class="sidebar-youtube__heading">動画</h3>

      <?php
      $yt_query = new WP_Query([
          'post_type'      => 'crestory',
          'posts_per_page' => 3,
          'orderby'        => 'date',
          'order'          => 'DESC',
          'tax_query'      => [[
              'taxonomy' => 'crestory_category',
              'field'    => 'slug',
              'terms'    => 'youtube',
          ]],
      ]);
      ?>

      <?php if ($yt_query->have_posts()): ?>
        <ul class="sidebar-youtube__list">
          <?php while ($yt_query->have_posts()): $yt_query->the_post(); ?>
            <?php
            if (has_post_thumbnail()) {
                $thumb = get_the_post_thumbnail_url(get_the_ID(), 'crestory-thumb');
            } else {
                $yt_url = crestix_crestory_meta('crestory_youtube_url');
                $thumb  = $yt_url ? crestory_get_youtube_thumbnail($yt_url) : '';
            }
            ?>
            <li class="sidebar-youtube__item">
              <a href="<?php the_permalink(); ?>">
                <div class="sidebar-youtube__thumb">
                  <?php if ($thumb): ?>
                    <img src="<?php echo esc_url($thumb); ?>" alt="<?php echo esc_attr(get_the_title()); ?>" loading="lazy">
                  <?php else: ?>
                    <div class="sidebar-youtube__no-thumb"></div>
                  <?php endif; ?>
                  <span class="sidebar-youtube__play" aria-hidden="true">▶</span>
                </div>
                <p class="sidebar-youtube__title"><?php the_title(); ?></p>
              </a>
            </li>
          <?php endwhile; wp_reset_postdata(); ?>
        </ul>
      <?php else: ?>
        <?php wp_reset_postdata(); ?>
        <p class="sidebar-youtube__empty">動画はまだありません</p>
      <?php endif; ?>
    </div>

  </div>
</aside>
