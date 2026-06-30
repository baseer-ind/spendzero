import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';
import 'router.dart';

class ProjectFutureApp extends StatelessWidget {
  const ProjectFutureApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Project Future',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      routerConfig: appRouter,
    );
  }
}
