<?php
if (!defined("ABSPATH")) exit;

function crestix_crestory_setup() {
  add_theme_support("title-tag");
  add_theme_support("post-thumbnails");
  add_theme_support("html5", ["search-form", "comment-form", "comment-list", "gallery", "caption", "style", "script"]);
  register_nav_menus(["primary" => "Primary Navigation"]);
}
add_action("after_setup_theme", "crestix_crestory_setup");

function crestix_crestory_assets() {
  wp_enqueue_style("crestix-crestory-fonts", "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Poppins:wght@600;700;800;900&display=swap", [], null);
  wp_enqueue_style("crestix-crestory-style", get_template_directory_uri() . "/assets/css/crestory.css", [], "1.1.0");
}
add_action("wp_enqueue_scripts", "crestix_crestory_assets");

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

function crestix_crestory_seed_content() {
  crestix_register_crestory();

  update_option("blogname", "CRESTORY｜Crestix採用広報メディア");
  update_option("blogdescription", "Crestixで働く人、事業、カルチャーの裏側を届けるストーリーメディア。");
  update_option("permalink_structure", "/%postname%/");

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

  flush_rewrite_rules();
}
add_action("after_switch_theme", "crestix_crestory_seed_content");
