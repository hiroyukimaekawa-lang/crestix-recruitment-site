<footer class="crestory-site-footer">
  <div class="crestory-container crestory-footer-inner">
    <div class="crestory-footer-brand">
      <strong>CRESTORY</strong>
      <p>by Crestix Inc.</p>
    </div>
    <nav class="crestory-footer-nav" aria-label="フッターナビゲーション">
      <a href="<?php echo esc_url(crestix_crestory_recruit_url("index.html")); ?>">採用サイトへ</a>
      <a href="<?php echo esc_url(crestix_crestory_recruit_url("entry.html")); ?>">Entry</a>
    </nav>
    <span class="crestory-footer-copy">&copy; <?php echo esc_html(date("Y")); ?> Crestix Inc. All Rights Reserved.</span>
  </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
