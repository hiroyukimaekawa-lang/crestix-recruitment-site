<?php
if (!defined("ABSPATH")) exit;

function crestix_crestory_setup() {
  add_theme_support("title-tag");
  add_theme_support("post-thumbnails");
  add_theme_support("html5", ["search-form", "comment-form", "comment-list", "gallery", "caption", "style", "script"]);
  add_theme_support("custom-logo");
  add_image_size("crestory-hero", 1200, 630, true);
  add_image_size("crestory-card", 600, 400, true);
  add_image_size("crestory-thumb", 300, 200, true);
  register_nav_menus([
    "primary" => "プライマリーメニュー",
    "footer" => "フッターメニュー",
  ]);
}
add_action("after_setup_theme", "crestix_crestory_setup");

function crestix_crestory_assets() {
  wp_enqueue_style("crestix-crestory-fonts", "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Poppins:wght@600;700;800;900&display=swap", [], null);
  wp_enqueue_style("crestix-crestory-icons", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css", [], "6.5.1");
  wp_enqueue_style("crestix-crestory-style", get_template_directory_uri() . "/assets/css/main.css", ["crestix-crestory-fonts", "crestix-crestory-icons"], "1.2.0");
  wp_enqueue_script("crestix-crestory-main", get_template_directory_uri() . "/assets/js/main.js", [], "1.0.0", true);
}
add_action("wp_enqueue_scripts", "crestix_crestory_assets");

remove_action("wp_head", "wp_generator");
remove_action("wp_head", "wlwmanifest_link");
remove_action("wp_head", "rsd_link");
add_filter("show_admin_bar", "__return_false");
add_filter("excerpt_length", fn() => 80);
add_filter("excerpt_more", fn() => "...");

function crestix_register_crestory() {
  register_post_type("crestory", [
    "labels" => [
      "name" => "CRESTORY",
      "singular_name" => "CRESTORY",
      "add_new_item" => "CRESTORY記事を追加",
      "edit_item" => "CRESTORY記事を編集",
      "all_items" => "CRESTORY記事一覧",
    ],
    "public" => true,
    "has_archive" => false,
    "rewrite" => ["slug" => "story", "with_front" => false],
    "menu_icon" => "dashicons-welcome-write-blog",
    "supports" => ["title", "editor", "excerpt", "thumbnail", "author", "revisions"],
    "show_in_rest" => true,
  ]);

  register_taxonomy("crestory_category", ["crestory"], [
    "labels" => ["name" => "CRESTORYカテゴリ", "singular_name" => "CRESTORYカテゴリ"],
    "public" => true,
    "hierarchical" => true,
    "rewrite" => ["slug" => "category"],
    "show_in_rest" => true,
  ]);

  register_taxonomy("crestory_tag", ["crestory"], [
    "labels" => ["name" => "CRESTORYタグ", "singular_name" => "CRESTORYタグ"],
    "public" => true,
    "hierarchical" => false,
    "rewrite" => ["slug" => "tag"],
    "show_in_rest" => true,
  ]);
}
add_action("init", "crestix_register_crestory");

function crestix_crestory_root_rewrite() {
  add_rewrite_rule("^([^/]+)/?$", 'index.php?crestory=$matches[1]', "top");
}
add_action("init", "crestix_crestory_root_rewrite");

function crestix_crestory_root_permalink($post_link, $post) {
  if ($post->post_type === "crestory" && $post->post_name) return home_url("/" . $post->post_name . "/");
  return $post_link;
}
add_filter("post_type_link", "crestix_crestory_root_permalink", 10, 2);

function crestix_crestory_meta_fields() {
  return [
    "crestory_author_name" => "著者名",
    "crestory_author_title" => "著者肩書き",
    "crestory_author_icon" => "著者アイコンURL",
    "crestory_lead" => "記事の短い説明文",
    "crestory_youtube_url" => "YouTube埋め込みURL",
    "crestory_external_url" => "外部リンクURL",
    "crestory_seo_title" => "SEOタイトル",
    "crestory_seo_description" => "SEOディスクリプション",
    "crestory_ogp_image" => "OGP画像URL",
  ];
}

function crestix_add_crestory_meta_boxes() {
  add_meta_box("crestory_meta", "CRESTORY設定", "crestix_render_crestory_meta_box", "crestory", "normal", "high");
}
add_action("add_meta_boxes", "crestix_add_crestory_meta_boxes");

function crestix_render_crestory_meta_box($post) {
  wp_nonce_field("crestory_meta_save", "crestory_meta_nonce");
  echo "<div class=\"crestory-admin-grid\">";
  foreach (crestix_crestory_meta_fields() as $key => $label) {
    $value = esc_attr(get_post_meta($post->ID, $key, true));
    echo "<p><label style=\"display:block;font-weight:700;margin-bottom:6px;\" for=\"" . esc_attr($key) . "\">" . esc_html($label) . "</label><input style=\"width:100%;min-height:38px;\" type=\"text\" id=\"" . esc_attr($key) . "\" name=\"" . esc_attr($key) . "\" value=\"" . $value . "\"></p>";
  }
  $featured = get_post_meta($post->ID, "crestory_featured", true);
  echo "<p><label><input type=\"checkbox\" name=\"crestory_featured\" value=\"1\" " . checked($featured, "1", false) . "> 注目記事にする</label></p>";
  echo "</div>";
}

function crestix_save_crestory_meta($post_id) {
  if (!isset($_POST["crestory_meta_nonce"]) || !wp_verify_nonce($_POST["crestory_meta_nonce"], "crestory_meta_save")) return;
  if (defined("DOING_AUTOSAVE") && DOING_AUTOSAVE) return;
  foreach (crestix_crestory_meta_fields() as $key => $label) {
    if (isset($_POST[$key])) update_post_meta($post_id, $key, sanitize_text_field($_POST[$key]));
  }
  update_post_meta($post_id, "crestory_featured", isset($_POST["crestory_featured"]) ? "1" : "0");
}
add_action("save_post_crestory", "crestix_save_crestory_meta");

function crestix_crestory_meta($key, $post_id = null) { return get_post_meta($post_id ?: get_the_ID(), $key, true); }
function crestix_crestory_terms($post_id = null) { return get_the_terms($post_id ?: get_the_ID(), "crestory_category") ?: []; }
function crestix_crestory_first_term($post_id = null) { $terms = crestix_crestory_terms($post_id); return $terms ? $terms[0] : null; }
function crestix_crestory_tag_terms($post_id = null) { return get_the_terms($post_id ?: get_the_ID(), "crestory_tag") ?: []; }

function crestix_crestory_recruit_url($path = "") {
  $base = defined("CRESTIX_RECRUIT_SITE_URL") ? CRESTIX_RECRUIT_SITE_URL : "https://hiroyukimaekawa-lang.github.io/crestix-recruitment-site";
  return rtrim($base, "/") . "/" . ltrim($path, "/");
}

function crestix_crestory_head_meta() {
  if (!is_singular("crestory")) return;
  $title = crestix_crestory_meta("crestory_seo_title") ?: get_the_title();
  $desc = crestix_crestory_meta("crestory_seo_description") ?: wp_strip_all_tags(get_the_excerpt());
  $ogp = crestix_crestory_meta("crestory_ogp_image") ?: get_the_post_thumbnail_url(get_the_ID(), "large");
  echo "\n<meta name=\"description\" content=\"" . esc_attr($desc) . "\">\n";
  echo "<meta property=\"og:title\" content=\"" . esc_attr($title) . "\">\n";
  echo "<meta property=\"og:description\" content=\"" . esc_attr($desc) . "\">\n";
  if ($ogp) echo "<meta property=\"og:image\" content=\"" . esc_url($ogp) . "\">\n";
}
add_action("wp_head", "crestix_crestory_head_meta");

function crestix_crestory_seed_matsuoka_interview() {
  crestix_register_crestory();

  foreach (["インタビュー", "メンバー"] as $name) {
    if (!term_exists($name, "crestory_category")) wp_insert_term($name, "crestory_category");
  }

  $interview_tags = ["メンバーインタビュー", "Crestix", "採用", "カルチャー"];
  foreach ($interview_tags as $name) {
    if (!term_exists($name, "crestory_tag")) wp_insert_term($name, "crestory_tag");
  }

  $content = <<<ARTICLE
<section class="crestory-interview-profile">
  <p class="crestory-profile-label">Profile</p>
  <dl>
    <div><dt>Name</dt><dd>松岡 龍士</dd></div>
    <div><dt>Position</dt><dd>第一営業部 統括</dd></div>
    <div><dt>Career</dt><dd>大学卒業後、大手企業での営業経験を経てCrestixに参画。圧倒的な成果を出し続け、現在のポジションに至る。</dd></div>
    <div><dt>Strength</dt><dd>現状に満足しない推進力と、周囲を巻き込むリーダーシップ。常に逆算思考で事業課題の解決にあたる。</dd></div>
  </dl>
</section>

<p class="crestory-question">Q. なぜCrestixへ入社を決めたのですか？</p>
<p>「日本で最も挑戦できる環境」というビジョンに強く共感したからです。前職でもそれなりに成果は出せていましたが、もっと圧倒的なスピードで成長したい、社会に大きなインパクトを残したいという思いがありました。Crestixの面接で代表やメンバーと話す中で、ここならそれが実現できると確信しました。</p>

<p class="crestory-question">Q. 現在はどんな仕事をしていますか？</p>
<p>第一営業部（医療機関向けマーケティング事業）の統括として、事業の成長を牽引する役割を担っています。単に目の前の数字を追うだけでなく、仕組み化やメンバーの育成、新規戦略の立案など、経営視点でのアクションが求められます。責任は大きいですが、その分裁量も大きく、毎日が刺激的です。</p>

<p class="crestory-question">Q. 入社して驚いたことは何ですか？</p>
<p>意思決定のスピードの速さと、年齢や社歴に関係なく意見がフラットに飛び交うカルチャーです。「誰が言ったか」ではなく「何を言ったか」が純粋に評価されるため、若手でも本質的な提案であれば即日採用されてプロジェクトが動き出します。</p>

<p class="crestory-question">Q. 今後挑戦したいことは？</p>
<p>今の事業を業界トップクラスまで引き上げることはもちろんですが、ゆくゆくは新しい事業領域の立ち上げにも挑戦したいです。Crestixにはそれを後押ししてくれる環境があるので、自分自身の限界を決めずに突き進んでいきたいと思っています。</p>

<p class="crestory-question">Q. どんな人に来てほしいですか？</p>
<p>現状維持を嫌い、常に変化と成長を求めている人ですね。未経験でも全く問題ありません。大切なのは「絶対に成し遂げてやる」という覚悟と熱量です。私たちと一緒に、最高の景色を見に行きましょう。</p>

<blockquote><p>迷ったら、より困難で挑戦的な道を選んでほしい。Crestixには、その挑戦を最高の仲間が全力で支える環境があります。</p></blockquote>

<figure class="wp-block-gallery has-nested-images columns-4 crestix-interview-gallery">
  <figure class="wp-block-image"><img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&amp;w=800&amp;auto=format&amp;fit=crop" alt="Work"></figure>
  <figure class="wp-block-image"><img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&amp;w=800&amp;auto=format&amp;fit=crop" alt="Meeting"></figure>
  <figure class="wp-block-image"><img src="https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?q=80&amp;w=800&amp;auto=format&amp;fit=crop" alt="Event"></figure>
  <figure class="wp-block-image"><img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&amp;w=800&amp;auto=format&amp;fit=crop" alt="Daily"></figure>
</figure>
ARTICLE;

  $existing = get_page_by_path("matsuoka-interview", OBJECT, "crestory");
  $post_data = [
    "post_type" => "crestory",
    "post_status" => "publish",
    "post_title" => "売上を作る最前線へ。第一営業部統括・松岡龍士の挑戦",
    "post_name" => "matsuoka-interview",
    "post_excerpt" => "第一営業部 統括として事業成長を牽引する松岡龍士。Crestixに入社した理由、現在担う役割、そしてこれから挑戦したい未来について聞きました。",
    "post_content" => $content,
  ];

  if ($existing) {
    $post_id = $existing->ID;
    if (trim((string) $existing->post_content) === "") {
      $post_data["ID"] = $post_id;
      wp_update_post($post_data);
    }
  } else {
    $post_id = wp_insert_post($post_data);
  }

  if (!is_wp_error($post_id) && $post_id) {
    wp_set_object_terms($post_id, ["インタビュー", "メンバー"], "crestory_category");
    wp_set_object_terms($post_id, $interview_tags, "crestory_tag");
    update_post_meta($post_id, "crestory_author_name", "松岡 龍士");
    update_post_meta($post_id, "crestory_author_title", "第一営業部 統括");
    update_post_meta($post_id, "crestory_lead", "第一営業部 統括として事業成長を牽引する松岡龍士。Crestixに入社した理由、現在担う役割、そしてこれから挑戦したい未来について聞きました。");
    update_post_meta($post_id, "crestory_ogp_image", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1600&auto=format&fit=crop");
    update_post_meta($post_id, "crestory_seo_title", "売上を作る最前線へ。第一営業部統括・松岡龍士の挑戦");
    update_post_meta($post_id, "crestory_seo_description", "第一営業部 統括として事業成長を牽引する松岡龍士のメンバーインタビュー。Crestixに入社した理由、仕事のやりがい、これから挑戦したいことを聞きました。");
  }
}

function crestix_crestory_seed_note_style_articles() {
  crestix_register_crestory();

  $seed_posts = [
    [
      "slug" => "culture-speed",
      "title" => "意思決定の速さが、挑戦の速度をつくる。Crestixのカルチャー",
      "excerpt" => "Crestixで大切にしているのは、誰が言ったかではなく何を言ったか。挑戦を前に進める組織文化の裏側を紹介します。",
      "content" => "<p>Crestixでは、役職や年次に関係なく、事業を前に進める提案が歓迎されます。</p><p>意思決定の速さは、単なるスピード感ではありません。顧客や仲間に向き合い、必要な変化を恐れずに実行するための文化です。</p><blockquote><p><strong>挑戦の数だけ、会社の可能性は広がっていく。</strong></p></blockquote><p>まだ完成された会社ではないからこそ、一人ひとりの意思決定が組織の未来を形づくっています。</p>",
      "categories" => ["カルチャー"],
      "tags" => ["Crestix", "カルチャー", "採用"],
      "author" => "Crestix編集部",
      "author_title" => "採用広報",
      "image" => "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1600&auto=format&fit=crop",
    ],
    [
      "slug" => "business-growth-story",
      "title" => "事業成長の最前線で、社会課題に向き合うということ",
      "excerpt" => "医療、店舗、AI・営業支援。Crestixが複数事業を通じて目指す、社会を前進させる事業づくりについて。",
      "content" => "<p>Crestixの事業は、現場にある課題から始まります。</p><p>クリニックや店舗、営業組織が抱える課題に向き合い、マーケティング、テクノロジー、AIを組み合わせながら成長を支援しています。</p><p>大切なのは、単なるサービス提供ではなく、顧客の未来に伴走することです。</p>",
      "categories" => ["事業"],
      "tags" => ["Crestix", "挑戦", "事業"],
      "author" => "Crestix編集部",
      "author_title" => "編集部",
      "image" => "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop",
    ],
    [
      "slug" => "recruit-selection-guide",
      "title" => "Crestixの選考で大切にしていること",
      "excerpt" => "スキルや経験だけではなく、挑戦する姿勢や成長への向き合い方を大切にしています。",
      "content" => "<p>Crestixの選考では、これまでの経験だけでなく、これから何に挑戦したいのかを大切にしています。</p><p>整った環境を待つのではなく、自分から機会をつくる人。そんな仲間と一緒に会社をつくっていきたいと考えています。</p>",
      "categories" => ["採用情報"],
      "tags" => ["採用", "Crestix"],
      "author" => "Crestix編集部",
      "author_title" => "採用広報",
      "image" => "",
    ],
  ];

  foreach ($seed_posts as $seed) {
    foreach ($seed["categories"] as $name) {
      if (!term_exists($name, "crestory_category")) wp_insert_term($name, "crestory_category");
    }
    foreach ($seed["tags"] as $name) {
      if (!term_exists($name, "crestory_tag")) wp_insert_term($name, "crestory_tag");
    }

    $existing = get_page_by_path($seed["slug"], OBJECT, "crestory");
    if ($existing) {
      $post_id = $existing->ID;
    } else {
      $post_id = wp_insert_post([
        "post_type" => "crestory",
        "post_status" => "publish",
        "post_title" => $seed["title"],
        "post_name" => $seed["slug"],
        "post_excerpt" => $seed["excerpt"],
        "post_content" => $seed["content"],
      ]);
    }

    if (!is_wp_error($post_id) && $post_id) {
      wp_set_object_terms($post_id, $seed["categories"], "crestory_category");
      wp_set_object_terms($post_id, $seed["tags"], "crestory_tag");
      update_post_meta($post_id, "crestory_author_name", $seed["author"]);
      update_post_meta($post_id, "crestory_author_title", $seed["author_title"]);
      update_post_meta($post_id, "crestory_lead", $seed["excerpt"]);
      if ($seed["image"]) update_post_meta($post_id, "crestory_ogp_image", $seed["image"]);
      update_post_meta($post_id, "like_count", (int) (get_post_meta($post_id, "like_count", true) ?: 0));
      update_post_meta($post_id, "bookmark_count", (int) (get_post_meta($post_id, "bookmark_count", true) ?: 0));
    }
  }
}

function crestix_crestory_seed_content() {
  crestix_register_crestory();

  update_option("blogname", "CRESTORY｜Crestix採用広報メディア");
  update_option("blogdescription", "Crestixで働く人、事業、カルチャーの裏側を届けるストーリーメディア。");
  update_option("permalink_structure", "/%postname%/");

  $front_page = get_page_by_path("crestory-top", OBJECT, "page");
  if (!$front_page) {
    $front_page_id = wp_insert_post([
      "post_type" => "page",
      "post_status" => "publish",
      "post_title" => "CRESTORYトップ",
      "post_name" => "crestory-top",
      "post_content" => "",
    ]);
  } else {
    $front_page_id = $front_page->ID;
  }

  if (!is_wp_error($front_page_id) && $front_page_id) {
    update_option("show_on_front", "page");
    update_option("page_on_front", $front_page_id);
  }

  $sample_page = get_page_by_path("sample-page", OBJECT, "page");
  if ($sample_page) {
    wp_delete_post($sample_page->ID, true);
  }

  $categories = ["代表メッセージ", "メンバー", "カルチャー", "事業", "インタビュー", "採用情報"];
  foreach ($categories as $name) {
    if (!term_exists($name, "crestory_category")) wp_insert_term($name, "crestory_category");
  }

  $tags = ["代表インタビュー", "Crestix", "挑戦", "採用", "カルチャー"];
  foreach ($tags as $name) {
    if (!term_exists($name, "crestory_tag")) wp_insert_term($name, "crestory_tag");
  }

  $existing = get_page_by_path("representative-interview", OBJECT, "crestory");
  if (!$existing) {
    $content = <<<ARTICLE
<p>今の会社に、大きな不満があるわけではない。営業として成果も出してきた。評価もされている。でも、ふとした瞬間に「このままでいいのか」と思うことがある。</p>
<p>もっと任されたい。もっと挑戦したい。もっと、自分の人生を大きく動かしたい。Crestixは、そんな想いを持つ人に出会いたい会社です。</p>
<p>株式会社Crestixが掲げるビジョンは、「世界一挑戦し続ける会社へ」。一見すると、大きすぎる言葉かもしれません。綺麗事に聞こえるかもしれません。でも、代表の縞谷は、この言葉を本気で掲げています。</p>
<h2>「世界一挑戦し続ける会社へ」は、綺麗な言葉ではなく、覚悟の言葉</h2>
<p class="crestory-question">――Crestixが掲げる「世界一挑戦し続ける会社へ」という言葉には、どんな想いが込められているのでしょうか？</p>
<p>大きな旗を掲げることは、簡単ではありません。言葉だけが先行すれば、現実との距離が見えてしまうからです。それでもCrestixは、あえて大きな言葉を掲げています。</p>
<blockquote><p><strong>Crestixにとっての挑戦とは、自分史上最高を更新することです。</strong></p></blockquote>
<p>昨日よりも今日、今月よりも来月、今年よりも来年。自分の基準を、自分の手で更新し続けること。その連続が、Crestixの考える挑戦です。</p>
<h2>無謀だと言われることの先に、見える景色がある</h2>
<p>挑戦は、いつも最初から理解されるものではありません。むしろ、少し無謀に見えることの先に、新しい景色があります。</p>
<p>大切なのは、勢いだけで進むことではなく、現実を見ながらも可能性を捨てないこと。Crestixは、その両方を大事にする会社です。</p>
<h2>会社のためではなく、自分の人生のために働く</h2>
<p class="crestory-question">――Crestixで働く人には、どんな姿勢を期待していますか？</p>
<blockquote><p><strong>会社のためではなく、自分のために働く人が集まる会社にしたいです。</strong></p></blockquote>
<p>会社の成長と個人の成長が重なるとき、仕事はただの役割ではなく、自分の人生を前に進める手段になります。Crestixは、そういう働き方を本気でつくろうとしています。</p>
<h2>求めているのは、会社に入る人ではなく、会社をつくる人</h2>
<blockquote><p><strong>Crestixが求めているのは、ただ会社に入って働く人ではありません。会社を一緒につくる人です。</strong></p></blockquote>
<p>決まった仕組みに乗るだけではなく、仕組みそのものをつくる。事業を伸ばすだけではなく、組織の文化や基準も一緒につくる。そんな当事者意識を持つ人に、Crestixは大きな機会を渡していきます。</p>
<h2>正直、整った会社ではない。それでも今入る意味がある</h2>
<p>すべてが完成された環境ではありません。だからこそ、今のCrestixには、一人ひとりの挑戦が会社の形を変えていく手触りがあります。</p>
<blockquote><p><strong>Crestixにあるのは、完成された環境ではなく、これからつくれる余白です。</strong></p></blockquote>
<p>整っていないことを不安と捉えるか、可能性と捉えるか。その違いが、Crestixでの成長を大きく分けます。</p>
<h2>今の環境に違和感があるなら、その感覚をなかったことにしなくていい</h2>
<p>「このままでいいのか」という違和感は、次の挑戦に向かうサインかもしれません。その感覚をなかったことにせず、自分の可能性を広げる選択をしてほしいと考えています。</p>
<p>Crestixは、挑戦したい人にとって、まだ余白のある会社です。だからこそ、誰かの正解をなぞるのではなく、自分たちで正解をつくっていけます。</p>
<h2>一緒に、世界一挑戦する会社をつくろう</h2>
<blockquote><p><strong>一緒に世界一挑戦する会社をつくろう。</strong></p></blockquote>
<p>大きすぎる旗を、本気で掲げる。その旗に向かって、自分史上最高を更新し続ける。Crestixは、そんな仲間と出会いたいと考えています。</p>
ARTICLE;

    $post_id = wp_insert_post([
      "post_type" => "crestory",
      "post_status" => "publish",
      "post_title" => "大きすぎる旗を、本気で掲げる。Crestixが「世界一挑戦し続ける会社」を目指す理由",
      "post_name" => "representative-interview",
      "post_excerpt" => "Crestixが掲げる「世界一挑戦し続ける会社へ」。その大きすぎる旗に込めた想いと、これから一緒に会社をつくる仲間に求めることを、代表・縞谷に聞きました。",
      "post_content" => $content,
    ]);

    if (!is_wp_error($post_id)) {
      wp_set_object_terms($post_id, ["代表メッセージ", "インタビュー"], "crestory_category");
      wp_set_object_terms($post_id, $tags, "crestory_tag");
      update_post_meta($post_id, "crestory_author_name", "Crestix編集部");
      update_post_meta($post_id, "crestory_author_title", "採用広報");
      update_post_meta($post_id, "crestory_lead", "Crestixが掲げる「世界一挑戦し続ける会社へ」。その大きすぎる旗に込めた想いと、これから一緒に会社をつくる仲間に求めることを、代表・縞谷に聞きました。");
      update_post_meta($post_id, "crestory_featured", "1");
      update_post_meta($post_id, "crestory_seo_title", "大きすぎる旗を、本気で掲げる。Crestixが「世界一挑戦し続ける会社」を目指す理由");
      update_post_meta($post_id, "crestory_seo_description", "Crestixが掲げる「世界一挑戦し続ける会社へ」。その大きすぎる旗に込めた想い、求める仲間像、そして今Crestixに入る意味について、代表・縞谷に聞きました。");
      update_post_meta($post_id, "crestory_ogp_image", "https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=1600&auto=format&fit=crop");
    }
  }

  crestix_crestory_seed_matsuoka_interview();
  crestix_crestory_seed_note_style_articles();

  flush_rewrite_rules();
}
add_action("after_switch_theme", "crestix_crestory_seed_content");

function crestix_track_post_views($post_id) {
  if (!$post_id) return;
  $count = (int) get_post_meta($post_id, "post_views_count", true);
  update_post_meta($post_id, "post_views_count", $count + 1);
}
add_action("wp", function () {
  if (is_singular("crestory")) crestix_track_post_views(get_the_ID());
});

function crestix_crestory_maybe_finalize_home() {
  if (!current_user_can("manage_options")) return;
  crestix_crestory_seed_matsuoka_interview();
  crestix_crestory_seed_note_style_articles();
  if (get_option("crestix_crestory_home_finalized") === "1") return;

  $front_page = get_page_by_path("crestory-top", OBJECT, "page");
  if (!$front_page) {
    $front_page_id = wp_insert_post([
      "post_type" => "page",
      "post_status" => "publish",
      "post_title" => "CRESTORYトップ",
      "post_name" => "crestory-top",
      "post_content" => "",
    ]);
  } else {
    $front_page_id = $front_page->ID;
  }

  if (!is_wp_error($front_page_id) && $front_page_id) {
    update_option("show_on_front", "page");
    update_option("page_on_front", $front_page_id);
  }

  $sample_page = get_page_by_path("sample-page", OBJECT, "page");
  if ($sample_page) wp_delete_post($sample_page->ID, true);

  update_option("crestix_crestory_home_finalized", "1");
}
add_action("admin_init", "crestix_crestory_maybe_finalize_home");
