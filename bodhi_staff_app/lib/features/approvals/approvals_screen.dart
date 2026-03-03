import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import 'package:bodhi_staff_app/ui/components/app_drawer.dart';
import 'package:flutter/material.dart';
import 'package:bodhi_staff_app/core/widgets/global_header.dart';
import '../../core/theme/app_theme.dart';
import 'package:local_auth/local_auth.dart';

class ApprovalItem {
  final String id;
  final String title;
  final String subtitle;
  final String requestorName;
  final bool requiresPin;

  ApprovalItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.requestorName,
    this.requiresPin = false,
  });
}

class ApprovalsScreen extends StatefulWidget {
  final List<ApprovalItem> pendingApprovals;

  const ApprovalsScreen({Key? key, required this.pendingApprovals})
      : super(key: key);

  @override
  State<ApprovalsScreen> createState() => _ApprovalsScreenState();
}

class _ApprovalsScreenState extends State<ApprovalsScreen> {
  late List<ApprovalItem> _approvals;

  @override
  void initState() {
    super.initState();
    _approvals = List.from(widget.pendingApprovals);
  }

  Future<void> _handleApprovalAction(ApprovalItem item, bool isApproved) async {
    // 1. PIN or Biometric Overlay for Sensitive actions (e.g. Finance, Leaves)
    if (isApproved && item.requiresPin) {
      final auth = LocalAuthentication();
      try {
        final didAuthenticate = await auth.authenticate(
          localizedReason:
              'Please authenticate to approve this sensitive request.',
          options: const AuthenticationOptions(biometricOnly: false),
        );

        if (!didAuthenticate) {
          // Re-insert item into list since auth failed
          setState(() => _approvals.insert(0, item));
          ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Authentication required.')));
          return;
        }
      } catch (e) {
        print(e);
      }
    }

    // 2. Play ANIM_APPROVAL_DONE Lottie
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
          content:
              Text('\${isApproved ? "Approved" : "Rejected"}: \${item.title}')),
    );

    // 3. Queue mutation for Offline Push
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      
      
      
      appBar: GlobalHeader(title: 'Pending Approvals'),
      body: _approvals.isEmpty
          ? const Center(
              child: Text('All caught up!',
                  style: TextStyle(color: AppTheme.textMuted)))
          : ListView.builder(
              itemCount: _approvals.length,
              itemBuilder: (context, index) {
                final item = _approvals[index];
                return Dismissible(
                  key: Key(item.id),
                  // Swipe Right = Approve, Swipe Left = Reject
                  background: _buildSwipeBackground(true),
                  secondaryBackground: _buildSwipeBackground(false),
                  onDismissed: (direction) {
                    setState(() => _approvals.removeAt(index));
                    _handleApprovalAction(
                        item, direction == DismissDirection.startToEnd);
                  },
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: AppTheme.s24, vertical: AppTheme.s8),
                    leading: CircleAvatar(
                      backgroundColor: item.requiresPin
                          ? AppTheme.warning.withOpacity(0.2)
                          : AppTheme.primaryLight.withOpacity(0.2),
                      child: Icon(
                          item.requiresPin ? Icons.lock : Icons.person_outline,
                          color: item.requiresPin
                              ? AppTheme.warning
                              : AppTheme.primaryDark),
                    ),
                    title: Text(item.title,
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(item.subtitle),
                        const SizedBox(height: 2),
                        Text('By: \${item.requestorName}',
                            style: TextStyle(
                                color: AppTheme.textMuted, fontSize: 12)),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  Widget _buildSwipeBackground(bool isApprove) {
    return Container(
      color: isApprove ? AppTheme.success : AppTheme.danger,
      alignment: isApprove ? Alignment.centerLeft : Alignment.centerRight,
      padding: const EdgeInsets.symmetric(horizontal: AppTheme.s24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isApprove ? Icons.check_circle_outline : Icons.cancel_outlined,
            color: Colors.white,
            size: 32,
          ),
          Text(
            isApprove ? 'Approve' : 'Reject',
            style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.bold),
          )
        ],
      ),
    );
  }
}
