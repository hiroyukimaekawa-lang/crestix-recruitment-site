<?php
get_header();

$quick_links = [
  [
    "label" => "採用情報",
    "description" => "Crestixの採用情報はこちら",
    "url" => crestix_crestory_recruit_url("entry.html"),
  ],
  [
    "label" => "カジュアル面談",
    "description" => "まずは気軽にお話ししましょう",
    "url" => crestix_crestory_recruit_url("entry.html"),
  ],
  [
    "label" => "Official HP",
    "description" => "Crestixの公式サイトはこちら",
    "url" => crestix_crestory_recruit_url("index.html"),
  ],
  [
    "label" => "募集職種",
    "description" => "現在募集中のポジションを見る",
    "url" => crestix_crestory_recruit_url("jobs.html"),
  ],
];

$magazines = [
  "代表メッセージ" => "Crestixが目指す未来と代表の想い",
  "メンバー" => "Crestixで働く人のリアル",
  "カルチャー" => "価値観・働き方・組織づくり",
  "事業" => "Crestixの事業と成長ストーリー",
  "インタビュー" => "社員・代表へのインタビュー",
  "採用情報" => "募集や選考に関するお知らせ",
];
?>
<main class="crestory-page" id="cx-main">
  <section class="crestory-profile-hero">
    <div class="crestory-container crestory-profile-wrap">
      <div class="crestory-profile-mark">CRESTORY</div>
      <div class="crestory-profile-copy">
        <p class="crestory-kicker">Crestix 採用広報メディア</p>
        <h1>CRESTORY</h1>
        <p class="crestory-profile-lead">Crestixで働く人、事業、カルチャーの裏側を届けるストーリーメディア。<br>挑戦する人の想い、会社づくりの裏側、事業の成長ストーリーを発信します。</p>
        <p class="crestory-profile-tagline">世界一挑戦し続ける会社へ。</p>
      </div>
    </div>
  </section>

  <section class="crestory-link-section" aria-label="CRESTORYリンク">
    <div class="crestory-container">
      <div class="crestory-link-grid">
        <?php foreach ($quick_links as $item): ?>
          <a class="crestory-link-card" href="<?php echo esc_url($item["url"]); ?>">
            <span><?php echo esc_html($item["label"]); ?></span>
            <p><?php echo esc_html($item["description"]); ?></p>
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="crestory-featured-section">
    <div class="crestory-container">
      <div class="crestory-section-head">
        <div>
          <p class="crestory-kicker">Pinned Story</p>
          <h2>固定された記事</h2>
        </div>
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
          </div>
          <div class="crestory-featured-body">
            <div class="crestory-featured-meta">
              <?php if ($term): ?><span class="crestory-card-category"><?php echo esc_html($term->name); ?></span><?php endif; ?>
              <time><?php echo esc_html(get_the_date("Y.m.d")); ?></time>
            </div>
            <h3><?php the_title(); ?></h3>
            <p><?php echo esc_html(crestix_crestory_meta("crestory_lead") ?: get_the_excerpt()); ?></p>
            <div class="crestory-featured-author">
              <?php echo get_avatar(get_the_author_meta("ID"), 32, "", "", ["class" => "crestory-avatar"]); ?>
              <span><?php echo esc_html(crestix_crestory_meta("crestory_author_name") ?: get_the_author()); ?></span>
            </div>
            <span class="crestory-read-more">READ MORE <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
          </div>
        </a>
      <?php wp_reset_postdata(); endif; ?>
    </div>
  </section>

  <section class="crestory-content" id="articles">
    <div class="crestory-container">
      <div class="crestory-section-head">
        <div>
          <p class="crestory-kicker">Latest Stories</p>
          <h2>最新の記事</h2>
        </div>
        <div class="crestory-tabs" id="cx-tabs" aria-label="記事タブ">
          <button class="is-active" data-feed="latest" type="button">新着</button>
          <button data-feed="popular" type="button">人気</button>
        </div>
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

  <section class="crestory-magazine-section">
    <div class="crestory-container">
      <div class="crestory-section-head">
        <div>
          <p class="crestory-kicker">Magazine</p>
          <h2>CRESTORY Magazine</h2>
        </div>
      </div>
      <div class="crestory-magazine-grid">
        <?php foreach ($magazines as $name => $description):
          $term = get_term_by("name", $name, "crestory_category");
          $term_link = $term ? get_term_link($term) : "";
          $url = ($term_link && !is_wp_error($term_link)) ? $term_link : home_url("/");
          $count = $term ? (int) $term->count : 0;
        ?>
          <a class="crestory-magazine-card" href="<?php echo esc_url($url); ?>">
            <span class="crestory-magazine-name"><?php echo esc_html($name); ?></span>
            <p><?php echo esc_html($description); ?></p>
            <div class="crestory-magazine-meta">
              <span><?php echo esc_html($count); ?> articles</span>
              <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </div>
          </a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="crestory-entry-cta crestory-home-cta crestory-container">
    <h2>Crestixで、自分史上最高を更新しませんか？</h2>
    <p>少しでも気になった方は、まずは一度お話ししましょう。</p>
    <div class="crestory-cta-buttons">
      <a href="<?php echo esc_url(crestix_crestory_recruit_url("entry.html")); ?>">ENTRY</a>
      <a href="<?php echo esc_url(crestix_crestory_recruit_url("jobs.html")); ?>" class="is-outline">募集職種を見る</a>
    </div>
  </section>
</main>
<?php get_footer(); ?>
