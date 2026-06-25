<?php
get_header();

$tab  = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'new';
if (!in_array($tab, ['new', 'popular', 'youtube'], true)) $tab = 'new';
$paged = max(1, (int) ($_GET['paged'] ?? 1));

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
} elseif ($tab === 'youtube') {
    $query_args['tax_query'] = [[
        'taxonomy' => 'crestory_category',
        'field'    => 'slug',
        'terms'    => 'youtube',
    ]];
}
$loop = new WP_Query($query_args);

$tabs = [
    'new'     => '新着',
    'popular' => '人気',
    'youtube' => 'YouTube',
];
?>
<main class="crestory-page note-layout" id="cx-main">

  <div class="note-wrapper">
    <?php get_sidebar('left'); ?>

    <div class="note-main">
      <?php get_template_part('template-parts/hero'); ?>

      <section class="note-articles-section" id="articles">

        <div class="note-tabs-row" id="cx-tabs" aria-label="記事タブ">
          <?php foreach ($tabs as $key => $label): ?>
            <a href="<?php echo esc_url(home_url('/?tab=' . $key)); ?>"
               class="<?php echo $tab === $key ? 'is-active' : ''; ?>"
               aria-current="<?php echo $tab === $key ? 'page' : 'false'; ?>">
              <?php echo esc_html($label); ?>
            </a>
          <?php endforeach; ?>
        </div>

        <p class="note-source-label">
          <i class="fa-regular fa-bookmark" aria-hidden="true"></i>
          「CRESTORYマガジン」から
        </p>

        <div class="note-grid" id="cx-grid">
          <?php if ($loop->have_posts()): ?>
            <?php while ($loop->have_posts()): $loop->the_post(); ?>
              <?php get_template_part('template-parts/card', 'crestory'); ?>
            <?php endwhile; wp_reset_postdata(); ?>
          <?php else: ?>
            <p class="crestory-empty">記事はまだありません。公開後、ここに一覧表示されます。</p>
          <?php endif; ?>
        </div>

        <?php if ($loop->max_num_pages > 1): ?>
          <div class="note-pagination">
            <?php
            echo paginate_links([
                'base'      => home_url('/') . '?tab=' . $tab . '&paged=%#%',
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
