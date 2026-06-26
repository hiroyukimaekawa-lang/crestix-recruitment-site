<?php
get_header();

$tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'new';
if (!in_array($tab, ['new', 'popular'], true)) $tab = 'new';

$cat_slug = isset($_GET['cat']) ? sanitize_text_field($_GET['cat']) : '';
$paged    = max(1, (int) ($_GET['paged'] ?? 1));

$query_args = [
    'post_type'           => 'crestory',
    'posts_per_page'      => 9,
    'paged'               => $paged,
    'ignore_sticky_posts' => true,
    'orderby'             => 'date',
    'order'               => 'DESC',
];

if ($tab === 'popular') {
    $query_args['meta_key'] = 'post_views_count';
    $query_args['orderby']  = 'meta_value_num';
    $query_args['order']    = 'DESC';
}

if ($cat_slug && $cat_slug !== 'all') {
    $query_args['tax_query'] = [[
        'taxonomy' => 'crestory_category',
        'field'    => 'slug',
        'terms'    => $cat_slug,
    ]];
}

$loop = new WP_Query($query_args);

$sort_tabs = [
    'new'     => '新着',
    'popular' => '人気',
];

$categories = get_terms([
    'taxonomy'   => 'crestory_category',
    'hide_empty' => true,
    'orderby'    => 'count',
    'order'      => 'DESC',
]);
?>
<main class="crestory-page note-layout" id="cx-main">

  <div class="note-wrapper">
    <?php get_sidebar('left'); ?>

    <div class="note-main">
      <?php get_template_part('template-parts/hero'); ?>

      <section class="note-articles-section" id="articles">

        <div class="note-tabs-row" id="cx-tabs" aria-label="並び替えタブ">
          <?php foreach ($sort_tabs as $key => $label): ?>
            <a href="<?php echo esc_url(add_query_arg(['tab' => $key, 'cat' => $cat_slug ?: false], home_url('/'))); ?>"
               class="<?php echo $tab === $key ? 'is-active' : ''; ?>"
               aria-current="<?php echo $tab === $key ? 'page' : 'false'; ?>">
              <?php echo esc_html($label); ?>
            </a>
          <?php endforeach; ?>
        </div>

        <?php if (!is_wp_error($categories) && $categories): ?>
        <div class="note-category-tabs" aria-label="カテゴリ">
          <a href="<?php echo esc_url(add_query_arg(['tab' => $tab, 'cat' => false], home_url('/'))); ?>"
             class="<?php echo !$cat_slug ? 'is-active' : ''; ?>">すべて</a>
          <?php foreach ($categories as $cat): ?>
            <a href="<?php echo esc_url(add_query_arg(['tab' => $tab, 'cat' => $cat->slug], home_url('/'))); ?>"
               class="<?php echo $cat_slug === $cat->slug ? 'is-active' : ''; ?>">
              <?php echo esc_html($cat->name); ?>
            </a>
          <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <div class="note-grid" id="cx-grid">
          <?php if ($loop->have_posts()): ?>
            <?php $post_index = 0; ?>
            <?php while ($loop->have_posts()): $loop->the_post(); ?>
              <?php
              set_query_var('cx_card_featured', ($post_index === 0 && $paged === 1));
              $post_index++;
              ?>
              <?php get_template_part('template-parts/card', 'crestory'); ?>
            <?php endwhile;
            set_query_var('cx_card_featured', false);
            wp_reset_postdata(); ?>
          <?php else: ?>
            <p class="crestory-empty">記事はまだありません。公開後、ここに一覧表示されます。</p>
          <?php endif; ?>
        </div>

        <?php if ($loop->max_num_pages > 1): ?>
          <div class="note-pagination">
            <?php
            echo paginate_links([
                'base'      => add_query_arg(['tab' => $tab, 'cat' => $cat_slug ?: false, 'paged' => '%#%'], home_url('/')),
                'format'    => '',
                'total'     => $loop->max_num_pages,
                'current'   => $paged,
                'prev_text' => '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>',
                'next_text' => '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>',
            ]);
            ?>
          </div>
        <?php endif; ?>

      </section>
    </div>
  </div>

  <section class="crestory-entry-cta crestory-home-cta crestory-container">
    <h2>Crestixで、自分史上最高を更新しませんか？</h2>
    <p>少しでも気になった方は、まずは一度お話ししましょう。</p>
    <div class="crestory-cta-buttons">
      <a href="<?php echo esc_url(crestix_crestory_recruit_url('entry.html')); ?>">ENTRY</a>
      <a href="<?php echo esc_url(crestix_crestory_recruit_url('jobs.html')); ?>" class="is-outline">募集職種を見る</a>
    </div>
  </section>

</main>
<?php get_footer(); ?>
