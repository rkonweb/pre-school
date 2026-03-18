import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:parent_app_flutter/core/theme/app_theme.dart';
import 'package:parent_app_flutter/features/dashboard/screens/shell_screen.dart' as parent_app_flutter;
import '../services/homework_service.dart';
import 'package:intl/intl.dart';

class HomeworkScreen extends StatefulWidget {
  const HomeworkScreen({Key? key}) : super(key: key);

  @override
  _HomeworkScreenState createState() => _HomeworkScreenState();
}

class _HomeworkScreenState extends State<HomeworkScreen> {
  Map<String, dynamic>? _homeworkData;
  bool _isLoading = true;
  String _errorMessage = '';
  
  String _activeTab = 'pending'; // 'pending', 'submitted', 'all'

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final studentId = prefs.getString('active_student_id');
      
      if (studentId == null) {
        setState(() {
          _errorMessage = "No active student selected.";
          _isLoading = false;
        });
        return;
      }

      final data = await HomeworkService.fetchHomework(studentId);
      setState(() {
        _homeworkData = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _onTabChanged(String tab) {
    setState(() {
      _activeTab = tab;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppTheme.bg, 
        body: Center(child: CircularProgressIndicator(color: AppTheme.a1))
      );
    }

    if (_errorMessage.isNotEmpty) {
      return Scaffold(
        backgroundColor: AppTheme.bg,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(_errorMessage, style: const TextStyle(color: Colors.red)),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () {
                  setState(() => _isLoading = true);
                  _loadData();
                },
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text('Retry'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.a1,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final pending = (_homeworkData?['pending'] as List<dynamic>?) ?? [];
    final completed = (_homeworkData?['completed'] as List<dynamic>?) ?? [];
    
    List<dynamic> allHomeworks = [...pending, ...completed];
    
    List<dynamic> displayItems = [];
    if (_activeTab == 'pending') {
      displayItems = pending;
    } else if (_activeTab == 'submitted') {
      displayItems = completed;
    } else {
      displayItems = allHomeworks;
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          _buildHeader(),
          _buildTabBar(pending.length),
          Expanded(
            child: _buildBody(displayItems),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      padding: const EdgeInsets.fromLTRB(18, 0, 18, 12),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            const SizedBox(height: 10),
            Container(
               width: 36, height: 4, 
               decoration: BoxDecoration(
                 color: const Color(0x59B49B78), // rgba(180,155,120,0.35)
                 borderRadius: BorderRadius.circular(2),
               ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Container(
                  width: 38, height: 38,
                  decoration: BoxDecoration(
                    color: AppTheme.peachBg,
                    border: Border.all(color: AppTheme.peachBorder),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: Icon(Icons.edit_document, color: AppTheme.peachAcc, size: 20),
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Homework Tracker',
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.t1,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    if (Navigator.canPop(context)) {
                      Navigator.pop(context);
                    } else {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const parent_app_flutter.ShellScreen()),
                      );
                    }
                  },
                  child: Container(
                    width: 30, height: 30,
                    decoration: BoxDecoration(
                      color: AppTheme.bg2,
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: const Center(
                      child: Icon(Icons.close, color: AppTheme.t2, size: 16),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabBar(int pendingCount) {
    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 0),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildTabButton('pending', 'Pending ($pendingCount)'),
            const SizedBox(width: 6),
            _buildTabButton('submitted', 'Submitted'),
            const SizedBox(width: 6),
            _buildTabButton('all', 'All'),
          ],
        ),
      ),
    );
  }

  Widget _buildTabButton(String tabId, String label) {
    final bool isActive = _activeTab == tabId;
    return GestureDetector(
      onTap: () => _onTabChanged(tabId),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.a1 : AppTheme.bg2,
          border: Border.all(color: isActive ? Colors.transparent : const Color(0xFFE5E7EB)),
          borderRadius: BorderRadius.circular(20),
          boxShadow: isActive 
              ? [const BoxShadow(color: Color(0x4D6366F1), blurRadius: 14, offset: Offset(0, 4))] 
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isActive ? Colors.white : AppTheme.t3,
          ),
        ),
      ),
    );
  }

  Map<String, Color> _getColorPalette(String sub) {
    String lower = sub.toLowerCase();
    if (lower.contains('math') || lower.contains('eng')) {
      return {'bg': const Color(0x21F97316), 'acc': AppTheme.peachAcc, 'text': AppTheme.peachAcc, 'border': AppTheme.peachBorder};
    } else if (lower.contains('sci')) {
      return {'bg': const Color(0x213B82F6), 'acc': AppTheme.skyAcc, 'text': AppTheme.skyAcc, 'border': AppTheme.skyBorder};
    } else if (lower.contains('cs') || lower.contains('comp')) {
      return {'bg': const Color(0x216366F1), 'acc': AppTheme.a1, 'text': AppTheme.a1, 'border': const Color(0x406366F1)};
    } else {
      return {'bg': AppTheme.mintBg, 'acc': AppTheme.mintAcc, 'text': AppTheme.mintText, 'border': AppTheme.mintBorder};
    }
  }

  Widget _buildBody(List<dynamic> items) {
    if (items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40.0),
          child: Text(
            'All caught up! 🎉',
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.t4),
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(18),
      itemCount: items.length,
      itemBuilder: (context, index) {
        return _buildHomeworkItem(items[index]);
      },
    );
  }

  Widget _buildHomeworkItem(dynamic hw) {
    final title = hw['title'] ?? 'Untitled';
    final subject = hw['subject'] ?? 'Subject';
    final desc = hw['description'] ?? '';
    final dueDateRaw = hw['dueDate'] as String?;
    final isPastDue = hw['isPastDue'] == true;
    final statusStr = isPastDue ? 'submitted' : 'pending';

    String parsedDue = 'No Date';
    if (dueDateRaw != null) {
      final dt = DateTime.tryParse(dueDateRaw);
      if (dt != null) {
        parsedDue = DateFormat('MMM d').format(dt);
      }
    }

    final palette = _getColorPalette(subject);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          top: const BorderSide(color: Color(0xFFF1F5F9)),
          right: const BorderSide(color: Color(0xFFF1F5F9)),
          bottom: const BorderSide(color: Color(0xFFF1F5F9)),
          left: BorderSide(color: palette['acc']!, width: 4.0),
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 8, offset: Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: palette['bg'],
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  subject,
                  style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: palette['text']),
                ),
              ),
              Text(
                'Due $parsedDue',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.t3),
              )
            ],
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppTheme.t1, height: 1.2),
          ),
          const SizedBox(height: 4),
          Text(
            desc,
            style: const TextStyle(fontSize: 12, color: AppTheme.t3, height: 1.4, fontWeight: FontWeight.w500),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              statusStr == 'pending'
                  ? Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0x1CF97316), // Light orange background for pending
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Text('⏳', style: TextStyle(fontSize: 11)),
                          SizedBox(width: 4),
                          Text('Pending', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.peachAcc)),
                        ],
                      ),
                    )
                  : Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0x1C10B981), // Light green background for submitted
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Text('✅', style: TextStyle(fontSize: 11)),
                          SizedBox(width: 4),
                          Text('Submitted', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.sageAcc)),
                        ],
                      ),
                    ),
              statusStr == 'pending'
                  ? RichText(
                      text: const TextSpan(
                        text: 'Priority: ',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.t3, fontFamily: 'Outfit'),
                        children: [
                          TextSpan(text: 'high', style: TextStyle(fontWeight: FontWeight.w800, color: AppTheme.t3)),
                        ]
                      )
                    )
                  : RichText(
                      text: const TextSpan(
                        text: 'Grade: ',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.t3, fontFamily: 'Outfit'),
                        children: [
                          TextSpan(text: 'A+', style: TextStyle(fontWeight: FontWeight.w800, color: AppTheme.t1)),
                        ]
                      )
                    ),
            ],
          )
        ],
      ),
    );
  }

}
