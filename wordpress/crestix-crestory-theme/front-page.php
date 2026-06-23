<?php get_header(); ?>
<main class="crestory-page" id="cx-main">
  <section class="crestory-hero">
    <div class="crestory-hero-bg"></div>
    <canvas id="hero-canvas" class="crestory-hero-canvas" aria-hidden="true"></canvas>
    <div class="crestory-hero-content">
      <span class="crestory-kicker">Crestix 採用広報メディア</span>
      <h1>CRESTORY</h1>
      <p class="crestory-hero-copy">Crestixで働く人、事業、カルチャーの裏側を届けるストーリーメディア。</p>
      <p class="crestory-hero-sub">挑戦する人の想い、チームの裏側、事業の成長ストーリーを届けます。</p>
      <div class="crestory-hero-actions">
        <a href="#articles" class="crestory-btn-primary">記事を読む <i class="fa-solid fa-arrow-down"></i></a>
        <a href="<?php echo esc_url(crestix_crestory_recruit_url("entry.html")); ?>" class="crestory-btn-outline">採用情報へ</a>
      </div>
    </div>
  </section>

  <section class="crestory-about">
    <div class="crestory-container">
      <p>CRESTORYは、Crestixの人・事業・カルチャーを届ける採用広報メディアです。<br>挑戦する人の想い、会社づくりの裏側、事業の成長ストーリーを発信します。</p>
    </div>
  </section>

  <section class="crestory-featured-section">
    <div class="crestory-container">
      <div class="crestory-section-label">
        <span></span>
        <strong>Featured</strong>
      </div>
      <?php
      $featured = new WP_Query([
        "post_type" => "crestory",
        "posts_per_page" => 1,
        "meta_key" => "crestory_featured",
        "meta_value" => "1",
      ]);
      if (!$featured->have_posts()) {
        $featured = new WP_Query(["post_type" => "crestory", "posts_per_page" => 1]);
      }
      if ($featured->have_posts()): $featured->the_post();
        $term = crestix_crestory_first_term();
      ?>
        <a class="crestory-featured" href="<?php the_permalink(); ?>">
          <div class="crestory-featured-image">
            <?php if (has_post_thumbnail()) { the_post_thumbnail("crestory-hero"); } else { echo "<span>CRESTORY</span>"; } ?>
            <div class="crestory-featured-overlay"></div>
          </div>
          <div class="crestory-featured-body">
            <div class="crestory-featured-meta">
              <?php if ($term): ?><span class="crestory-card-category"><?php echo esc_html($term->name); ?></span><?php endif; ?>
              <time><?php echo esc_html(get_the_date("Y.m.d")); ?></time>
            </div>
            <h2><?php the_title(); ?></h2>
            <p><?php echo esc_html(crestix_crestory_meta("crestory_lead") ?: get_the_excerpt()); ?></p>
            <div class="crestory-featured-author">
              <?php echo get_avatar(get_the_author_meta("ID"), 32, "", "", ["class" => "crestory-avatar"]); ?>
              <span><?php echo esc_html(crestix_crestory_meta("crestory_author_name") ?: get_the_author()); ?></span>
            </div>
            <span class="crestory-read-more">READ MORE <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </a>
      <?php wp_reset_postdata(); endif; ?>
    </div>
  </section>

  <section class="crestory-content" id="articles">
    <div class="crestory-container">
      <div class="crestory-tabs" id="cx-tabs" aria-label="CRESTORYカテゴリ">
        <button class="is-active" data-cat="all" type="button">すべて</button>
        <?php
        $terms = get_terms([
          "taxonomy" => "crestory_category",
          "hide_empty" => true,
          "orderby" => "count",
          "order" => "DESC",
        ]);
        if (!is_wp_error($terms)):
          foreach ($terms as $term):
        ?>
          <button data-cat="<?php echo esc_attr($term->slug); ?>" type="button"><?php echo esc_html($term->name); ?></button>
        <?php endforeach; endif; ?>
      </div>

      <div class="crestory-section-head">
        <p class="crestory-kicker">Latest Stories</p>
        <h2>最新記事</h2>
      </div>

      <div class="crestory-grid" id="cx-grid">
        <?php
        $latest = new WP_Query(["post_type" => "crestory", "posts_per_page" => 12, "ignore_sticky_posts" => true]);
        if ($latest->have_posts()):
          while ($latest->have_posts()): $latest->the_post();
            get_template_part("template-parts/card", "crestory");
          endwhile;
          wp_reset_postdata();
        else:
        ?>
          <p class="crestory-empty">記事はまだありません。公開後、ここに一覧表示されます。</p>
        <?php endif; ?>
      </div>
    </div>
  </section>
</main>
<?php get_footer(); ?>
