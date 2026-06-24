<?php
$hero_featured = new WP_Query([
    'post_type'           => 'crestory',
    'posts_per_page'      => 3,
    'meta_key'            => 'crestory_featured',
    'meta_value'          => '1',
    'orderby'             => 'date',
    'order'               => 'DESC',
    'ignore_sticky_posts' => true,
]);
$hero_posts = $hero_featured->posts;
wp_reset_postdata();

if (count($hero_posts) < 3) {
    $exclude = array_map(fn($p) => $p->ID, $hero_posts);
    $extra   = new WP_Query([
        'post_type'           => 'crestory',
        'posts_per_page'      => 3 - count($hero_posts),
        'post__not_in'        => $exclude ?: [0],
        'orderby'             => 'date',
        'order'               => 'DESC',
        'ignore_sticky_posts' => true,
    ]);
    $hero_posts = array_merge($hero_posts, $extra->posts);
    wp_reset_postdata();
}

if (!$hero_posts) return;
?>
<section class="note-hero" aria-label="固定された記事">
  <p class="note-hero-label">
    <i class="fa-solid fa-thumbtack" aria-hidden="true"></i> 固定された記事
  </p>
  <div class="note-hero-grid">
    <?php foreach (array_slice($hero_posts, 0, 3) as $idx => $hero_post):
      setup_postdata($hero_post);
      $term        = crestix_crestory_first_term($hero_post->ID);
      $thumb_url   = get_the_post_thumbnail_url($hero_post->ID, 'crestory-hero')
                     ?: crestix_crestory_meta('crestory_ogp_image', $hero_post->ID);
      $author_name = crestix_crestory_meta('crestory_author_name', $hero_post->ID)
                     ?: get_the_author_meta('display_name', $hero_post->post_author);
      $avatar_url  = crestix_crestory_meta('crestory_author_icon', $hero_post->ID)
                     ?: get_avatar_url($hero_post->post_author, ['size' => 24]);
      $pub_date    = human_time_diff(get_the_time('U', $hero_post), current_time('timestamp')) . '前';
      $like_count  = (int)(get_post_meta($hero_post->ID, 'like_count', true) ?: 0);
      $bookmark_count = (int)(get_post_meta($hero_post->ID, 'bookmark_count', true) ?: 0);
      $permalink   = get_permalink($hero_post);
    ?>

    <?php if ($idx === 0): ?>
      <!-- Card 1: テキストのみ・大カード (44%) -->
      <a class="note-hero-card note-hero-card--text" href="<?php echo esc_url($permalink); ?>">
        <?php if ($term): ?>
          <span class="note-card-cat">#<?php echo esc_html($term->name); ?></span>
        <?php endif; ?>
        <h2 class="note-hero-title"><?php echo esc_html(get_the_title($hero_post)); ?></h2>
        <span class="note-hero-logo-watermark" aria-hidden="true">CRESTORY</span>
        <div class="note-hero-card-bottom">
          <div class="note-card-meta">
            <div class="note-meta-author">
              <?php if ($avatar_url): ?>
                <img class="note-avatar-xs" src="<?php echo esc_url($avatar_url); ?>" width="16" height="16" alt="" loading="lazy">
              <?php endif; ?>
              <span><?php echo esc_html(get_bloginfo('name')); ?></span>
            </div>
            <span class="note-meta-date"><?php echo esc_html($pub_date); ?></span>
          </div>
          <div class="note-card-reactions">
            <span><i class="fa-regular fa-heart" aria-hidden="true"></i> <?php echo esc_html($like_count); ?></span>
            <span><i class="fa-regular fa-bookmark" aria-hidden="true"></i> <?php echo esc_html($bookmark_count); ?></span>
          </div>
        </div>
      </a>

    <?php elseif ($idx === 1): ?>
      <!-- Card 2: 画像全面・中カード (37%) -->
      <a class="note-hero-card note-hero-card--image" href="<?php echo esc_url($permalink); ?>">
        <?php if ($thumb_url): ?>
          <img class="note-hero-img" src="<?php echo esc_url($thumb_url); ?>" alt="<?php echo esc_attr(get_the_title($hero_post)); ?>" loading="lazy">
        <?php else: ?>
          <span class="note-hero-img-placeholder" aria-hidden="true">CRESTORY</span>
        <?php endif; ?>
        <div class="note-hero-overlay">
          <h2 class="note-hero-title"><?php echo esc_html(get_the_title($hero_post)); ?></h2>
          <div class="note-card-meta note-card-meta--light">
            <div class="note-meta-author">
              <?php if ($avatar_url): ?>
                <img class="note-avatar-xs" src="<?php echo esc_url($avatar_url); ?>" width="16" height="16" alt="" loading="lazy">
              <?php endif; ?>
              <span><?php echo esc_html(get_bloginfo('name')); ?></span>
            </div>
            <span class="note-meta-date"><?php echo esc_html($pub_date); ?></span>
          </div>
        </div>
      </a>

    <?php else: ?>
      <!-- Card 3: テキスト・小カード・再生アイコン風 (19%) -->
      <a class="note-hero-card note-hero-card--small" href="<?php echo esc_url($permalink); ?>">
        <?php if ($term): ?>
          <span class="note-card-cat note-card-cat--top">#<?php echo esc_html($term->name); ?></span>
        <?php endif; ?>
        <i class="fa-solid fa-play note-play-icon" aria-hidden="true"></i>
        <h2 class="note-hero-title note-hero-title--sm"><?php echo esc_html(get_the_title($hero_post)); ?></h2>
        <div class="note-meta-author">
          <?php if ($avatar_url): ?>
            <img class="note-avatar-sm" src="<?php echo esc_url($avatar_url); ?>" width="24" height="24" alt="" loading="lazy">
          <?php endif; ?>
          <span><?php echo esc_html($author_name); ?></span>
          <span class="note-meta-from">のから</span>
        </div>
        <div class="note-card-reactions">
          <span><i class="fa-regular fa-heart" aria-hidden="true"></i> <?php echo esc_html($like_count); ?></span>
          <span><i class="fa-regular fa-bookmark" aria-hidden="true"></i> <?php echo esc_html($bookmark_count); ?></span>
        </div>
      </a>
    <?php endif; ?>

    <?php endforeach; wp_reset_postdata(); ?>
  </div>
</section>
