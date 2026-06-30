<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo("charset"); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="crestory-site-header" id="cx-header">
  <div class="crestory-header-inner">
    <a class="crestory-site-logo" href="<?php echo esc_url(home_url("/")); ?>" aria-label="CRESTORY トップへ">
      <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/images/crestory.png'); ?>" alt="CRESTORY" class="crestory-logo-img">
    </a>
    <nav class="crestory-site-nav" aria-label="グローバルナビゲーション">
      <a href="<?php echo esc_url(crestix_crestory_recruit_url("corporate.html")); ?>">Corporate</a>
      <a href="<?php echo esc_url(crestix_crestory_recruit_url("business.html")); ?>">Service</a>
      <a href="<?php echo esc_url(crestix_crestory_recruit_url("members.html")); ?>">Members</a>
      <a href="<?php echo esc_url(home_url("/")); ?>" class="is-current">Crestory</a>
    </nav>
    <a class="crestory-entry-link" href="<?php echo esc_url(crestix_crestory_recruit_url("entry.html")); ?>">Entry</a>
    <button class="crestory-hamburger" id="cx-hamburger" aria-label="メニュー" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="crestory-drawer" id="cx-drawer">
    <a href="<?php echo esc_url(crestix_crestory_recruit_url("corporate.html")); ?>">Corporate</a>
    <a href="<?php echo esc_url(crestix_crestory_recruit_url("business.html")); ?>">Service</a>
    <a href="<?php echo esc_url(crestix_crestory_recruit_url("members.html")); ?>">Members</a>
    <a href="<?php echo esc_url(home_url("/")); ?>">Crestory</a>
    <a href="<?php echo esc_url(crestix_crestory_recruit_url("entry.html")); ?>" class="drawer-entry">Entry</a>
  </div>
</header>
