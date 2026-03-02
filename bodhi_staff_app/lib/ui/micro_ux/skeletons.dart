import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme/app_theme.dart';

/// Global Skeleton Shimmer container for all loading states
class SkeletonLoader extends StatelessWidget {
  final double width;
  final double height;
  final BorderRadius? borderRadius;

  const SkeletonLoader({
    Key? key,
    this.width = double.infinity,
    this.height = 20,
    this.borderRadius,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppTheme.border.withOpacity(0.5),
      highlightColor: AppTheme.surface,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: borderRadius ?? AppTheme.radiusSmall,
        ),
      ),
    );
  }
}

/// Specific Skeleton for the Dashboard Timeline
class TimelineSkeleton extends StatelessWidget {
  const TimelineSkeleton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: AppTheme.radiusLarge,
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(AppTheme.s16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SkeletonLoader(width: 120, height: 24),
                const SkeletonLoader(width: 40, height: 16),
              ],
            ),
          ),
          const Divider(height: 1, color: AppTheme.border),
          ...List.generate(3, (index) => _buildRow()),
          Padding(
            padding: const EdgeInsets.all(AppTheme.s16),
            child:
                SkeletonLoader(height: 50, borderRadius: AppTheme.radiusMedium),
          ),
        ],
      ),
    );
  }

  Widget _buildRow() {
    return Padding(
      padding: const EdgeInsets.only(top: AppTheme.s16, right: AppTheme.s16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(width: 20),
          const SkeletonLoader(
              width: 12,
              height: 12,
              borderRadius: BorderRadius.all(Radius.circular(6))),
          const SizedBox(width: 28),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SkeletonLoader(width: 60, height: 12),
                const SizedBox(height: 4),
                const SkeletonLoader(width: 150, height: 16),
                const SizedBox(height: 4),
                const SkeletonLoader(width: 100, height: 12),
                const SizedBox(height: AppTheme.s16),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Specific skeleton for Student Contact Lists / Attendance
class StudentListSkeleton extends StatelessWidget {
  const StudentListSkeleton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 8,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.all(AppTheme.s16),
          child: Row(
            children: [
              const SkeletonLoader(
                  width: 40,
                  height: 40,
                  borderRadius: BorderRadius.all(Radius.circular(20))),
              const SizedBox(width: AppTheme.s16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SkeletonLoader(width: 180, height: 16),
                    const SizedBox(height: 8),
                    const SkeletonLoader(width: 80, height: 12),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
