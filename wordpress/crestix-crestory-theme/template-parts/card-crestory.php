<?php
$term = crestix_crestory_first_term();
$terms = crestix_crestory_terms();
$tags = array_slice(crestix_crestory_tag_terms(), 0, 3);
$cat_slugs = implode(" ", array_map(fn($t) => $t->slug, $terms));
?>
<article class="crestory-card" data-cats="<?php echo esc_attr($cat_slugs); ?>">
<a class="crestory-card-link" href="<?php the_permalink(); ?>">
  <div class="crestory-card-image"><?php if (has_post_thumbnail()) { the_post_thumbnail("crestory-card"); } else { echo "<span>CRESTORY</span>"; } ?></div>
  <div class="crestory-card-body">
    <?php if ($term): ?><span class="crestory-card-category"><?php echo esc_html($term->name); ?></span><?php endif; ?>
    <h3><?php the_title(); ?></h3>
    <p><?php echo esc_html(crestix_crestory_meta("crestory_lead") ?: get_the_excerpt()); ?></p>
    <?php if ($tags): ?><div class="crestory-card-tags"><?php foreach ($tags as $tag): ?><span>#<?php echo esc_html($tag->name); ?></span><?php endforeach; ?></div><?php endif; ?>
    <div class="crestory-card-meta"><span><?php echo esc_html(crestix_crestory_meta("crestory_author_name") ?: get_the_author()); ?></span><time><?php echo esc_html(get_the_date("Y.m.d")); ?></time></div>
  </div>
</a>
</article>
