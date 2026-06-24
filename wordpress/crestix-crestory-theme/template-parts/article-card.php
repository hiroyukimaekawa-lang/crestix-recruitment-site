<?php
$term           = crestix_crestory_first_term();
$author_name    = crestix_crestory_meta('crestory_author_name') ?: get_the_author();
$avatar_url     = crestix_crestory_meta('crestory_author_icon') ?: get_avatar_url(get_the_author_meta('ID'), ['size' => 28]);
$like_count     = (int) (get_post_meta(get_the_ID(), 'like_count', true) ?: 0);
$bookmark_count = (int) (get_post_meta(get_the_ID(), 'bookmark_count', true) ?: 0);
$relative_date  = human_time_diff(get_the_time('U'), current_time('timestamp')) . '前';
$has_thumb      = has_post_thumbnail() || (bool) crestix_crestory_meta('crestory_ogp_image');
$terms          = crestix_crestory_terms();
$cat_slugs      = implode(' ', array_map(fn($t) => $t->slug, $terms));
$source_label   = $term ? $term->name : 'CRESTORY';
?>
<article class="note-card <?php echo $has_thumb ? 'note-card--image' : 'note-card--text'; ?>" data-cats="<?php echo esc_attr($cat_slugs); ?>">
  <p class="note-card-source">
    <i class="fa-regular fa-bookmark" aria-hidden="true"></i>
    「<?php echo esc_html($source_label); ?>」から
  </p>
  <a class="note-card-link" href="<?php the_permalink(); ?>">

    <?php if ($has_thumb): ?>
      <div class="note-card-thumb">
        <?php if (has_post_thumbnail()): ?>
          <?php the_post_thumbnail('crestory-card'); ?>
        <?php else: ?>
          <img src="<?php echo esc_url(crestix_crestory_meta('crestory_ogp_image')); ?>" alt="<?php echo esc_attr(get_the_title()); ?>" loading="lazy">
        <?php endif; ?>
      </div>
      <div class="note-card-body">
        <h3 class="note-card-title"><?php the_title(); ?></h3>
        <div class="note-card-footer">
          <div class="note-meta-author">
            <?php if ($avatar_url): ?>
              <img class="note-avatar-sm" src="<?php echo esc_url($avatar_url); ?>" width="28" height="28" alt="" loading="lazy">
            <?php endif; ?>
            <span><?php echo esc_html($author_name); ?></span>
            <span class="note-card-site-logo" aria-hidden="true">CRESTORY</span>
          </div>
          <div class="note-card-reactions">
            <span class="note-meta-date"><?php echo esc_html($relative_date); ?></span>
            <span><i class="fa-regular fa-heart" aria-hidden="true"></i> <?php echo esc_html($like_count); ?></span>
            <span><i class="fa-regular fa-bookmark" aria-hidden="true"></i> <?php echo esc_html($bookmark_count); ?></span>
          </div>
        </div>
      </div>

    <?php else: ?>
      <div class="note-card-body--text">
        <?php if ($term): ?>
          <span class="note-card-cat-text">#<?php echo esc_html($term->name); ?></span>
        <?php endif; ?>
        <h3 class="note-card-title"><?php the_title(); ?></h3>
        <div class="note-card-footer">
          <div class="note-meta-author">
            <?php if ($avatar_url): ?>
              <img class="note-avatar-sm" src="<?php echo esc_url($avatar_url); ?>" width="28" height="28" alt="" loading="lazy">
            <?php endif; ?>
            <span><?php echo esc_html($author_name); ?></span>
            <span class="note-card-site-logo" aria-hidden="true">CRESTORY</span>
          </div>
          <div class="note-card-reactions">
            <span class="note-meta-date"><?php echo esc_html($relative_date); ?></span>
            <span><i class="fa-regular fa-heart" aria-hidden="true"></i> <?php echo esc_html($like_count); ?></span>
            <span><i class="fa-regular fa-bookmark" aria-hidden="true"></i> <?php echo esc_html($bookmark_count); ?></span>
          </div>
        </div>
      </div>
    <?php endif; ?>

  </a>
</article>
