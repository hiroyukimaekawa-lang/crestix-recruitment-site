<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo("charset"); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="crestory-site-header">
  <a class="crestory-site-logo" href="<?php echo esc_url(home_url("/")); ?>" aria-label="CRESTORY トップへ">
    <span class="crestory-logo-main">CRESTIX</span>
    <span class="crestory-logo-sub">CRESTORY</span>
  </a>
  <nav class="crestory-site-nav" aria-label="グローバルナビゲーション">
    <a href="<?php echo esc_url(crestix_crestory_recruit_url("corporate.html")); ?>">Corporate</a>
    <a href="<?php echo esc_url(crestix_crestory_recruit_url("business.html")); ?>">Service</a>
    <a href="<?php echo esc_url(crestix_crestory_recruit_url("members.html")); ?>">Members</a>
    <a href="<?php echo esc_url(home_url("/")); ?>" class="is-current">Crestory</a>
    <a class="crestory-entry-link" href="<?php echo esc_url(crestix_crestory_recruit_url("entry.html")); ?>">Entry</a>
  </nav>
</header>
