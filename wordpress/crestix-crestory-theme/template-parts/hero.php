<?php
// Hero image: theme option → latest post thumbnail → placeholder
$hero_image_url = get_option('crestory_hero_image', '');
if (!$hero_image_url) {
    $latest = get_posts(['post_type' => 'crestory', 'posts_per_page' => 1, 'fields' => 'ids']);
    if ($latest) {
        $hero_image_url = get_the_post_thumbnail_url($latest[0], 'large') ?: '';
    }
}
?>
<section class="cx-hero">
  <div class="cx-hero__text">
    <p class="cx-hero__kicker">CRESTORY</p>
    <h1 class="cx-hero__catch">挑戦する人の、<br>リアルな声を届ける。</h1>
    <p class="cx-hero__sub">CRESTORYは、Crestixの人・事業・カルチャーを届ける採用広報メディアです。</p>
    <a class="cx-hero__cta" href="#articles">記事を読む →</a>
  </div>
  <div class="cx-hero__image">
    <?php if ($hero_image_url): ?>
      <img src="<?php echo esc_url($hero_image_url); ?>" alt="CRESTORY" loading="eager">
    <?php else: ?>
      <div class="cx-hero__image-placeholder">CRESTORY</div>
    <?php endif; ?>
  </div>
</section>
