<?php get_header(); ?>
<main class="crestory-page">
  <section class="crestory-hero">
    <div class="crestory-container crestory-hero-grid">
      <div>
        <p class="crestory-kicker">Crestix Story Media</p>
        <h1>CRESTORY</h1>
        <p class="crestory-hero-copy">Crestixで働く人、事業、カルチャーの裏側を届けるストーリーメディア。</p>
        <p class="crestory-hero-sub">挑戦する人の想い、チームの裏側、事業の成長ストーリーを届けます。</p>
      </div>
      <div class="crestory-profile">
        <div class="crestory-logo">Crestix</div>
        <p>CRESTORYは、Crestixの人・事業・カルチャーを届ける採用広報メディアです。挑戦する人の想い、会社づくりの裏側、事業の成長ストーリーを発信します。</p>
        <div class="crestory-profile-links">
          <a href="<?php echo esc_url(crestix_crestory_recruit_url("jobs.html")); ?>">採用情報</a>
          <a href="<?php echo esc_url(crestix_crestory_recruit_url("entry.html")); ?>">ENTRY</a>
          <a href="https://note.com/crestory_crestix" target="_blank" rel="noopener noreferrer">note</a>
        </div>
      </div>
    </div>
  </section>

  <section class="crestory-content crestory-container">
    <aside class="crestory-tabs" aria-label="CRESTORYカテゴリ">
      <a class="is-active" href="<?php echo esc_url(home_url("/")); ?>">すべて</a>
      <?php foreach (["代表メッセージ", "メンバー", "カルチャー", "事業", "インタビュー", "採用情報"] as $label): $term = get_term_by("name", $label, "crestory_category"); if ($term): ?>
        <a href="<?php echo esc_url(get_term_link($term)); ?>"><?php echo esc_html($term->name); ?></a>
      <?php endif; endforeach; ?>
    </aside>

    <?php $featured = new WP_Query(["post_type"=>"crestory", "posts_per_page"=>1, "meta_key"=>"crestory_featured", "meta_value"=>"1"]); if ($featured->have_posts()): $featured->the_post(); ?>
      <a class="crestory-featured" href="<?php the_permalink(); ?>">
        <div class="crestory-featured-image"><?php if (has_post_thumbnail()) { the_post_thumbnail("large"); } else { echo "<span>CRESTORY</span>"; } ?></div>
        <div><span>注目記事</span><h2><?php the_title(); ?></h2><p><?php echo esc_html(crestix_crestory_meta("crestory_lead") ?: get_the_excerpt()); ?></p></div>
      </a>
    <?php wp_reset_postdata(); endif; ?>

    <div class="crestory-section-head">
      <p class="crestory-kicker">Latest Stories</p>
      <h2>最新記事</h2>
    </div>

    <div class="crestory-grid">
      <?php $latest = new WP_Query(["post_type"=>"crestory", "posts_per_page"=>12]); if ($latest->have_posts()): while ($latest->have_posts()): $latest->the_post(); get_template_part("template-parts/card", "crestory"); endwhile; wp_reset_postdata(); else: ?>
        <p class="crestory-empty">記事はまだありません。公開後、ここに一覧表示されます。</p>
      <?php endif; ?>
    </div>
  </section>
</main>
<?php get_footer(); ?>
