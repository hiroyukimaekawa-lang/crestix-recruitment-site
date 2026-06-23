<?php get_header(); ?>
<main class="crestory-page">
  <section class="crestory-hero crestory-tax-hero">
    <div class="crestory-container">
      <p class="crestory-kicker">404 Not Found</p>
      <h1>ページが見つかりません</h1>
      <p class="crestory-hero-copy">お探しのページは移動または削除された可能性があります。</p>
      <div class="crestory-hero-actions">
        <a href="<?php echo esc_url(home_url("/")); ?>" class="crestory-btn-primary">CRESTORYトップへ</a>
      </div>
    </div>
  </section>
</main>
<?php get_footer(); ?>
