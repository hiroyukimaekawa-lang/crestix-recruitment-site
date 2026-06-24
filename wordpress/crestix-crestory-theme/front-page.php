<?php
get_header();

$current_feed = (isset($_GET['feed']) && $_GET['feed'] === 'popular') ? 'popular' : 'latest';
$paged        = max(1, (int) ($_GET['paged'] ?? 1));

if ($current_feed === 'popular') {
    $query_args = [
        'post_type'           => 'crestory',
        'posts_per_page'      => 9,
        'paged'               => $paged,
        'meta_key'            => 'post_views_count',
        'orderby'             => 'meta_value_num',
        'order'               => 'DESC',
        'ignore_sticky_posts' => true,
    ];
} else {
    $query_args = [
        'post_type'           => 'crestory',
        'posts_per_page'      => 9,
        'paged'               => $paged,
        'orderby'             => 'date',
        'order'               => 'DESC',
        'ignore_sticky_posts' => true,
    ];
}
$loop = new WP_Query($query_args);

if ($current_feed === 'popular' && !$loop->have_posts()) {
    wp_reset_postdata();
    $loop = new WP_Query([
        'post_type'           => 'crestory',
        'posts_per_page'      => 9,
        'paged'               => $paged,
        'orderby'             => 'date',
        'order'               => 'DESC',
        'ignore_sticky_posts' => true,
    ]);
}
?>
<main class="crestory-page note-layout" id="cx-main">

  <div class="note-wrapper">
    <?php get_sidebar('left'); ?>

    <div class="note-main">
      <?php get_template_part('template-parts/hero'); ?>

      <section class="note-articles-section" id="articles">

        <div class="note-tabs-row" id="cx-tabs" aria-label="記事タブ">
          <a href="<?php echo esc_url(home_url('/')); ?>"
             class="<?php echo $current_feed === 'latest' ? 'is-active' : ''; ?>"
             aria-current="<?php echo $current_feed === 'latest' ? 'page' : 'false'; ?>">新着</a>
          <a href="<?php echo esc_url(home_url('/?feed=popular')); ?>"
             class="<?php echo $current_feed === 'popular' ? 'is-active' : ''; ?>"
             aria-current="<?php echo $current_feed === 'popular' ? 'page' : 'false'; ?>">人気</a>
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
            $paginate_base = $current_feed === 'popular'
                ? home_url('/') . '?feed=popular&paged=%#%'
                : home_url('/') . '?paged=%#%';
            echo paginate_links([
                'base'      => $paginate_base,
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
